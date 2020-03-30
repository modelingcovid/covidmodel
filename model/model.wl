(* ::Package:: *)

(** Model parameters. See https://docs.google.com/spreadsheets/d/1DH58EFf_YkWHa_zn8-onBGzsYFMamjSjOItr137vu9g/edit#gid=0 **)
SetDirectory[$UserDocumentsDirectory<>"/Github/covidmodel"];

Import["model/data.wl"];
Import["model/plot-utils.wl"];

(* model predict max *)
tmax = 365;

(*Rate of progressing to infectiousness, days*)
daysFromInfectedToInfectious0 = 2.8;

(*Rate of losing infectiousness or going to the hospital*)
daysUntilNotInfectiousOrHospitalized0 = 2.5;

(*Rate of leaving hospital for those not going to critical care*)
daysToLeaveHosptialNonCritical0 = 8;

(*Rate of leaving hospital and going to critical care*)
daysTogoToCriticalCare0 = 3;

(*Rate of leaving critical care, weeks*)
daysFromCriticalToRecoveredOrDeceased0 = 2.5;

pPCRH0 = 0.8;
pPCRNH0 = 0.08;

(* How out of date are reports of hospitalizations? *)
daysForHospitalsToReportCases0 = 1;

daysToGetTestedIfNotHospitalized0 = 5.5;
daysToGetTestedIfHospitalized0 = 1.5;

(* the penalty to fatailty rate in the case patients cannot get ICU care *) 
icuOverloadDeathPenalty0 = 2;
 
(* virus start parameters *)
initialInfectionImpulse0 = 12.5;

(*Duration of pulse in force of infection for establishment, days*)
importlength0 = 3;

(*Establishment time, N days before X Cases*)
importtime0 = (31+20);

(* mitigation parameters *)
r0natural0 = 3.1;

(*Fraction of critical patents who pass *)
fractionOfCriticalDeceased0 = 0.3;

USAPopulation = (327.2*10^6);

(* less than 3000 cases in a country the size of the US *)
containmentThresholdRatio0 = 3000/USAPopulation;

(* interpret as: steepness of age depencence*)
medianHospitalizationAge0 = 65;

(* interpret as: steepness of age depencence*)
ageCriticalDependence0 = 3;

ageHospitalizedDependence0 = 5;

pHospitalized100Yo = 0.25;

(*Probability of needing critical care*)
pCriticalGivenHospitalized100Yo = 0.3;

(*Probability of hospitalization but not critical care*)
pC0 = pCriticalGivenHospitalized100Yo*pHospitalized100Yo;

(*Probability of not needing care*)
pH0 = (1-pCriticalGivenHospitalized100Yo)*pHospitalized100Yo;

pS0 = 1-(pC0 + pH0);

(** Utils **)
      
today=QuantityMagnitude[DateDifference[DateList[{2020,1,1}],Today]];

CovidModel[
r0natural_,
daysUntilNotInfectiousOrHospitalized_,
daysFromInfectedToInfectious_,
daysUntilNotInfectiousOrHospitalized_,
daysToLeaveHosptialNonCritical_,
pPCRNH_,
pPCRH_,
daysTogoToCriticalCare_,
daysFromCriticalToRecoveredOrDeceased_,
fractionOfCriticalDeceased_,
importtime_,
importlength_,
initialInfectionImpulse_,
tmax_,
pS_,
pH_,
pC_,
containmentThresholdCases_,
icuCapacity_,
distancing_,
hospitalCapacity_:1000000, (*defaulted since we dont evaluate this on a country basis yet *)
tMin_
]:=
Reap[NDSolve[{
	
	Sq'[t]    == (-distancing[t] *
			 	  r0natural *
				  Iq[t] *
				  Sq[t]) / daysUntilNotInfectiousOrHospitalized
	 			 - est[t] * Sq[t],
	
	Eq'[t]    == (distancing[t] *
			 	  r0natural *
				  Iq[t] *
				  Sq[t]) / daysUntilNotInfectiousOrHospitalized
				 + est[t] * Sq[t] 
				 - Eq[t] / daysFromInfectedToInfectious,
	
	(* Infectious total, not yet PCR confirmed, age indep *)
	Iq[t]     == ISq[t] + IHq[t] + ICq[t],
	
	(* Infected without needing care *)
	ISq'[t]   == pS*Eq[t]/daysFromInfectedToInfectious - ISq[t]/daysUntilNotInfectiousOrHospitalized,
	
	(* Recovered without needing care *)
	RSq'[t]   == ISq[t]/daysUntilNotInfectiousOrHospitalized,
	
	(* Infected and will need hospital, won't need critical care *)	
	IHq'[t]   == pH*Eq[t]/daysFromInfectedToInfectious - IHq[t]/daysUntilNotInfectiousOrHospitalized,

	(* Going to hospital *) 
	HHq'[t]   == IHq[t]/daysUntilNotInfectiousOrHospitalized - HHq[t]/daysToLeaveHosptialNonCritical,
	
	(* Reported positive hospital cases *)
	RepHq'[t] == (pPCRH * HHq'[t]) / daysForHospitalsToReportCases0,

	(* Cumulative hospitalized count *)	
	EHq'[t]   == IHq[t]/daysUntilNotInfectiousOrHospitalized,

	(* Recovered after hospitalization *)	
	RHq'[t]   == HHq[t]/daysToLeaveHosptialNonCritical,

	(* pcr confirmation *)	
	PCR'[t]   == (pPCRNH*Iq[t])/daysToGetTestedIfNotHospitalized0 + (pPCRH*HHq[t])/daysToGetTestedIfHospitalized0,

	(* Infected, will need critical care *)	
	ICq'[t]   == pC*Eq[t]/daysFromInfectedToInfectious - ICq[t]/daysUntilNotInfectiousOrHospitalized,
	
	(* Hospitalized, need critical care *)
	HCq'[t]   == ICq[t]/daysUntilNotInfectiousOrHospitalized - HCq[t]/daysTogoToCriticalCare,

	(* Entering critical care *)	
	CCq'[t]   == HCq[t]/daysTogoToCriticalCare - CCq[t]/daysFromCriticalToRecoveredOrDeceased,
	
	(* Dying *)
	Deaq'[t]  == CCq[t]*If[CCq[t]>=icuCapacity,2*fractionOfCriticalDeceased,fractionOfCriticalDeceased]/daysFromCriticalToRecoveredOrDeceased,
	
	(* Leaving critical care *)
	RCq'[t]   == CCq[t]*(1-fractionOfCriticalDeceased)/daysFromCriticalToRecoveredOrDeceased,
	
	est'[t]   == 0,

	WhenEvent[Iq[t]<=containmentThresholdCases&&PCR[t]<=0.1,Sow[{t,Iq[t]},"containment"]], (* when the virus is contained without herd immunity extract the time *)
	WhenEvent[RSq[t]+RSq[t]+RCq[t] >= 0.7, Sow[{t,RSq[t]+RSq[t]+RCq[t]},"herd"]],
	WhenEvent[CCq[t]>=icuCapacity,Sow[{t,CCq[t]},"icu"]], (* ICU Capacity overshot *)
	WhenEvent[HHq[t]>=hospitalCapacity,Sow[{t,HHq[t]},"hospital"]],(* Hospitals Capacity overshot *)
	WhenEvent[t>=importtime , est[t]->Exp[-initialInfectionImpulse]], 
	WhenEvent[t >importtime+importlength, est[t]->0 ],
	Sq[0] ==1, Eq[0]==0,ISq[0]==0,RSq[0]==0,IHq[0]==0,
	HHq[0]==0,RepHq[0]==0,RHq[0]==0,ICq[0]==0,HCq[0]==0,CCq[0]==0,RCq[0]==0,Deaq[0]==0,est[0]==0,PCR[0]==0,
	EHq[0]==0
	},
	{Sq, Eq, ISq, RSq, IHq, HHq, RHq, RepHq, Iq,ICq, EHq, HCq, CCq, RCq,Deaq,PCR,est},
	{t, tMin, tmax}
],{"containment","herd","icu","hospital"},Rule];


(* this is a modified version of CovidModel that does not take an r0 or importtime value, but isntead returns a parametric
ndsolve which is used later to fit those parameters against data *)

(* TODO: add event for herd immunity, adjust containment threshold to something more reasonable *)
CovidModelFit[
daysUntilNotInfectiousOrHospitalized_,
daysFromInfectedToInfectious_,
daysUntilNotInfectiousOrHospitalized_,
daysToLeaveHosptialNonCritical_,
pPCRNH_,
pPCRH_,
daysTogoToCriticalCare_,
daysFromCriticalToRecoveredOrDeceased_,
fractionOfCriticalDeceased_,
importlength_,
initialInfectionImpulse_,
tmax_,
pS_,
pH_,
pC_,
distancing_,
icuCapacity_
]:=
ParametricNDSolveValue[{
	
	Sq'[t]    == (-distancing[t] *
			 	  r0natural *
				  Iq[t] *
				  Sq[t]) / daysUntilNotInfectiousOrHospitalized
	 			 - establishment[t] * Sq[t],
	
	Eq'[t]    == (distancing[t] *
			 	  r0natural *
				  Iq[t] *
				  Sq[t]) / daysUntilNotInfectiousOrHospitalized
				 + establishment[t] * Sq[t] 
				 - Eq[t] / daysFromInfectedToInfectious,
	
	(* Infectious total, not yet PCR confirmed, age indep *)
	Iq[t]     == ISq[t] + IHq[t] + ICq[t],
	
	(* Infected without needing care *)
	ISq'[t]   == pS*Eq[t]/daysFromInfectedToInfectious - ISq[t]/daysUntilNotInfectiousOrHospitalized,
	
	(* Recovered without needing care *)
	RSq'[t]   == ISq[t]/daysUntilNotInfectiousOrHospitalized,
	
	(* Infected and will need hospital, won't need critical care *)	
	IHq'[t]   == pH*Eq[t]/daysFromInfectedToInfectious - IHq[t]/daysUntilNotInfectiousOrHospitalized,

	(* Going to hospital *) 
	HHq'[t]   == IHq[t]/daysUntilNotInfectiousOrHospitalized - HHq[t]/daysToLeaveHosptialNonCritical,
	
	(* Reported positive hospital cases *)
	RepHq'[t] == (pPCRH * HHq'[t]) / daysForHospitalsToReportCases0,

	(* Cumulative hospitalized count *)	
	EHq'[t]   == IHq[t]/daysUntilNotInfectiousOrHospitalized,

	(* Recovered after hospitalization *)	
	RHq'[t]   == HHq[t]/daysToLeaveHosptialNonCritical,

	(* pcr confirmation *)	
	PCR'[t]   == (pPCRNH*Iq[t])/daysToGetTestedIfNotHospitalized0 + (pPCRH*HHq[t])/daysToGetTestedIfHospitalized0,

	(* Infected, will need critical care *)	
	ICq'[t]   == pC*Eq[t]/daysFromInfectedToInfectious - ICq[t]/daysUntilNotInfectiousOrHospitalized,
	
	(* Hospitalized, need critical care *)
	HCq'[t]   == ICq[t]/daysUntilNotInfectiousOrHospitalized - HCq[t]/daysTogoToCriticalCare,

	(* Entering critical care *)	
	CCq'[t]   == HCq[t]/daysTogoToCriticalCare - CCq[t]/daysFromCriticalToRecoveredOrDeceased,
	
	(* Dying *)
	Deaq'[t]  == CCq[t]*If[CCq[t]>=icuCapacity, icuOverloadDeathPenalty0*fractionOfCriticalDeceased,fractionOfCriticalDeceased]/daysFromCriticalToRecoveredOrDeceased,
	
	(* Leaving critical care *)
	RCq'[t]   == CCq[t]*(1-fractionOfCriticalDeceased)/daysFromCriticalToRecoveredOrDeceased,
	
	establishment'[t]   == 0,
	
	WhenEvent[t>=importtime , establishment[t]->Exp[-initialInfectionImpulse]], 
	WhenEvent[t >importtime+importlength, establishment[t]->0 ],
	Sq[0] ==1, Eq[0]==0,ISq[0]==0,RSq[0]==0,IHq[0]==0,
	HHq[0]==0,RepHq[0]==0,RHq[0]==0,ICq[0]==0,HCq[0]==0,CCq[0]==0,RCq[0]==0,Deaq[0]==0,establishment[0]==0,PCR[0]==0,
	EHq[0]==0
	}/.{r0natural->Exp[r0natural],importtime->Exp[importtime]},
	{Deaq, PCR, RepHq, Sq, Eq, ISq, RSq, IHq, HHq, RHq, Iq,ICq, EHq, HCq, CCq, RCq, establishment},
	{t, 0, tmax},
	{r0natural, importtime}
];

(* Assumption here is that age dependence follows a logistic curve -- zero year olds dont require any care, 
100 year olds require significant case, midpoint is the medianHospitalization age *)
infectedCritical[a_,medianHospitalizationAge_,pCLimit_,ageCriticalDependence_] := 
	pCLimit/(1+Exp[-((a-medianHospitalizationAge)/ageCriticalDependence)]);

infectedHospitalized[a_,medianHospitalizationAge_,pHLimit_,ageHospitalizedDependence_] :=
	pHLimit/(1+Exp[-((a-medianHospitalizationAge)/ageHospitalizedDependence)]);

noCare[a_,medianHospitalizationAge_,pCLimit_, pHLimit_,ageCriticalDependence_,ageHospitalizedDependence_] := 
	1-infectedCritical[a, medianHospitalizationAge, pCLimit,ageCriticalDependence]-
	infectedHospitalized[a, medianHospitalizationAge,pHLimit, ageHospitalizedDependence];

countryParams[country_, pCLimit_,pHLimit_,medianHospitalizationAge_,ageCriticalDependence_,ageHospitalizedDependence_] := 
	Module[{raw,pop,dist,buckets},
		raw = cachedAgeDistributionFor[country];
		pop = raw["Population"];
		dist = raw["Distribution"];
		buckets = raw["Buckets"];

(*return a map of per state params to values *)
<|"Population"->pop,
"importtime0"->countryImportTime[country],
"ventilators"->countryVentilators[country],
"pS"->Sum[noCare[a, medianHospitalizationAge, pCLimit,pHLimit,ageCriticalDependence,ageHospitalizedDependence ]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pH"->Sum[infectedHospitalized[a, medianHospitalizationAge, pHLimit,ageHospitalizedDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pC"->Sum[infectedCritical[a, medianHospitalizationAge, pCLimit,ageCriticalDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}]|>
];

stateParams[state_, pCLimit_,pHLimit_,medianHospitalizationAge_,ageCriticalDependence_,ageHospitalizedDependence_]:=Module[{raw,pop,dist,buckets},
raw = stateRawDemographicData[state];
pop = raw["Population"];
dist = raw["Distribution"];
buckets = raw["Buckets"];

(*return a map of per state params to values *)
<|"Population"->pop,
"importtime0"->If[!KeyExistsQ[stateImportTime, state],Min[#["day"]&/@Select[parsedData,(#["state"]==state&&#["positive"]>=50)&]] - 20,stateImportTime[state]], (* importtime 20 days before 50 PCR confirmed reached *)
"ventilators"->ventilators[state],
"icuBeds"->stateICUData[state]["icuBeds"],
"staffedBeds"->stateICUData[state]["staffedBeds"],
"bedUtilization"->stateICUData[state]["bedUtilization"],
(* WB: check below *)
"R0"-> stateDistancing[state,scenario1,1]*(r0natural0/100),
"pS"->Sum[noCare[a, medianHospitalizationAge, pCLimit,pHLimit,ageCriticalDependence,ageHospitalizedDependence ]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pH"->Sum[infectedHospitalized[a, medianHospitalizationAge, pHLimit,ageHospitalizedDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pC"->Sum[infectedCritical[a, medianHospitalizationAge, pCLimit,ageCriticalDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}]|>
];

(* TODO: should get the fit first and then evaluate scenario -- in this case the same fit is duplicated 4 times *)
evaluateScenario[state_, fitParams_, lciuci_, scenario_]:=Module[{
    distance,
    params,
    sol,evts,
    lcimodel,ucimodel,
    lcisol,lcievts,
    ucisol,ucievts,
    model,
    estimate,
    lci,uci,
    t,
    thisStateData,
    icuCapacity,
    hospitalCapacity,
    hospitalizationData,
    timeSeriesData,
    summary
    },
    
	params=stateParams[state,pC0,pH0,medianHospitalizationAge0,ageCriticalDependence0,ageHospitalizedDependence0];
	thisStateData=Select[parsedData,(#["state"]==state&&#["positive"]>0)&];
	icuCapacity=params["icuBeds"]/params["Population"];
	hospitalCapacity=(1-params["bedUtilization"])*params["staffedBeds"]/params["Population"];
	hospitalizationData = stateHospitalizationData[state];
	distance[t_] := stateDistancing[state, scenario, t];
	
	(* separate models for the lci, estimate, and uci of r0 / importtime *)
	{lcisol,lcievts}=CovidModel[
	lciuci["r0natural"][[1]],
	daysUntilNotInfectiousOrHospitalized0,
	daysFromInfectedToInfectious0,
	daysUntilNotInfectiousOrHospitalized0,
	daysToLeaveHosptialNonCritical0,
	pPCRNH0,
	pPCRH0,
	daysTogoToCriticalCare0,
	daysFromCriticalToRecoveredOrDeceased0,
	fractionOfCriticalDeceased0,
	lciuci["importtime"][[1]],
	importlength0,
	initialInfectionImpulse0,
	tmax,
	params["pS"],
	params["pH"],
	params["pC"],
	containmentThresholdRatio0,
	icuCapacity,
	distance,
	hospitalCapacity,
	Ceiling[lciuci["importtime"][[1]]]
	];
	
	{sol,evts}=CovidModel[
	fitParams["r0natural"],
	daysUntilNotInfectiousOrHospitalized0,
	daysFromInfectedToInfectious0,
	daysUntilNotInfectiousOrHospitalized0,
	daysToLeaveHosptialNonCritical0,
	pPCRNH0,
	pPCRH0,
	daysTogoToCriticalCare0,
	daysFromCriticalToRecoveredOrDeceased0,
	fractionOfCriticalDeceased0,
	fitParams["importtime"],
	importlength0,
	initialInfectionImpulse0,
	tmax,
	params["pS"],
	params["pH"],
	params["pC"],
	containmentThresholdRatio0,
	icuCapacity,
	distance,
	hospitalCapacity,
	Ceiling[lciuci["importtime"][[1]]]
	];
	
	{ucisol,ucievts}=CovidModel[
	lciuci["r0natural"][[2]],
	daysUntilNotInfectiousOrHospitalized0,
	daysFromInfectedToInfectious0,
	daysUntilNotInfectiousOrHospitalized0,
	daysToLeaveHosptialNonCritical0,
	pPCRNH0,
	pPCRH0,
	daysTogoToCriticalCare0,
	daysFromCriticalToRecoveredOrDeceased0,
	fractionOfCriticalDeceased0,
	lciuci["importtime"][[2]],
	importlength0,
	initialInfectionImpulse0,
	tmax,
	params["pS"],
	params["pH"],
	params["pC"],
	containmentThresholdRatio0,
	icuCapacity,
	distance,
	hospitalCapacity,
	Ceiling[lciuci["importtime"][[1]]]
	];
	
	events=Association[Flatten[evts]];
	endOfYear = 365;
	(* we  chop off the data here with one of either a containment or herd immunity events *)
	endOfEval = If[KeyExistsQ[events, "containment"], events["containment"][[1]][[1]],endOfYear];
	
	timeSeriesData=Table[Module[{},
	
	Association[{
	"day"->t,
	"distancing"->distance[t],
	
	"cumulativePcr" -> Association[{
	   "confirmed"-> If[Length[Select[thisStateData,(#["day"]==t)&]] != 1, Null, Select[thisStateData,(#["day"]==t)&][[1]]["positive"]],
	   "projected"-> If[Evaluate[params["Population"]*(PCR[t])/.sol][[1]] < 1, Null, Evaluate[params["Population"]*(PCR[t])/.sol][[1]]],
	   "lci"-> If[Evaluate[params["Population"]*(PCR[t])/.lcisol][[1]] < 1, Null, Evaluate[params["Population"]*(PCR[t])/.lcisol][[1]]],
	   "uci" -> If[Evaluate[params["Population"]*(PCR[t])/.ucisol][[1]] < 1, Null, Evaluate[params["Population"]*(PCR[t])/.ucisol][[1]]]
	}],
	"cumulativeDeaths" -> <|
	   "confirmed"-> If[Length[Select[thisStateData,(#["day"]==t)&]] != 1, Null,Select[thisStateData,(#["day"]==t)&][[1]]["death"]],
	   "projected"-> If[Evaluate[params["Population"]*(Deaq[t])/.sol][[1]] < 1, Null, Evaluate[params["Population"]*(Deaq[t])/.sol][[1]]],
	   "lci"-> If[Evaluate[params["Population"]*(Deaq[t])/.lcisol][[1]] < 1, Null, Evaluate[params["Population"]*(Deaq[t])/.lcisol][[1]]],
	   "uci" -> If[Evaluate[params["Population"]*(Deaq[t])/.ucisol][[1]] < 1, Null, Evaluate[params["Population"]*(Deaq[t])/.ucisol][[1]]]
	|>,
	"currentlyInfected" -> <|
	   "projected"-> If[Evaluate[params["Population"]*(Eq[t])/.sol][[1]] < 1, Null, Evaluate[params["Population"]*(Eq[t])/.sol][[1]]],
	   "lci"-> If[Evaluate[params["Population"]*(Eq[t])/.lcisol][[1]] < 1, Null, Evaluate[params["Population"]*(Eq[t])/.lcisol][[1]]],
	   "uci" -> If[Evaluate[params["Population"]*(Eq[t])/.ucisol][[1]] < 1, Null, Evaluate[params["Population"]*(Eq[t])/.ucisol][[1]]]
	|>,
	"currentlyInfectious" -> <|
	   "projected"-> If[Evaluate[params["Population"]*(Iq[t])/.sol][[1]] < 1, Null, Evaluate[params["Population"]*(Iq[t])/.sol][[1]]],
	   "lci"-> If[Evaluate[params["Population"]*(Iq[t])/.lcisol][[1]] < 1, Null, Evaluate[params["Population"]*(Iq[t])/.lcisol][[1]]],
	   "uci" -> If[Evaluate[params["Population"]*(Iq[t])/.ucisol][[1]] < 1, Null, Evaluate[params["Population"]*(Iq[t])/.ucisol][[1]]]
	|>, 
	"cumulativeInfections" -> <|
	   "projected"-> If[Evaluate[params["Population"]*(Evaluate[params["Population"]*(RSq[t]+RHq[t]+RCq[t])/.sol][[1]])/.sol][[1]]< 1, Null, Evaluate[params["Population"]*(Evaluate[params["Population"]*(RSq[t]+RHq[t]+RCq[t])/.sol][[1]])/.sol][[1]]],
	   "lci"-> If[Evaluate[params["Population"]*(Evaluate[params["Population"]*(RSq[t]+RHq[t]+RCq[t])/.sol][[1]])/.lcisol][[1]] < 1, Null, Evaluate[params["Population"]*(Evaluate[params["Population"]*(RSq[t]+RHq[t]+RCq[t])/.sol][[1]])/.lcisol][[1]]],
	   "uci" -> If[Evaluate[params["Population"]*(Evaluate[params["Population"]*(RSq[t]+RHq[t]+RCq[t])/.sol][[1]])/.ucisol][[1]] < 1, Null, Evaluate[params["Population"]*(Evaluate[params["Population"]*(RSq[t]+RHq[t]+RCq[t])/.sol][[1]])/.ucisol][[1]]]
	|>,
	"currentlyReportedHospitalized" -> <|
	   "confirmed"->If[Length[Select[hospitalizationData,(#["day"]==t)&]]!=1, Null,Select[hospitalizationData,(#["day"]==t)&][[1]]["hospitalizations"]],
	   "projected"-> If[Evaluate[params["Population"]*(RepHq[t])/.sol][[1]] < 1, Null, Evaluate[params["Population"]*(RepHq[t])/.sol][[1]]],
	   "lci"-> If[Evaluate[params["Population"]*(RepHq[t])/.lcisol][[1]] < 1, Null, Evaluate[params["Population"]*(RepHq[t])/.lcisol][[1]]],
	   "uci" -> If[Evaluate[params["Population"]*(RepHq[t])/.ucisol][[1]] < 1, Null, Evaluate[params["Population"]*(RepHq[t])/.ucisol][[1]]]
	|>,
	"currentlyHospitalized" -> <|
	   "projected"-> If[Evaluate[params["Population"]*(HHq[t])/.sol][[1]] < 1, Null, Evaluate[params["Population"]*(HHq[t])/.sol][[1]]],
	   "lci"-> If[Evaluate[params["Population"]*(HHq[t])/.lcisol][[1]] < 1, Null, Evaluate[params["Population"]*(HHq[t])/.lcisol][[1]]],
	   "uci" -> If[Evaluate[params["Population"]*(HHq[t])/.ucisol][[1]] < 1, Null, Evaluate[params["Population"]*(HHq[t])/.ucisol][[1]]]
	|>,
	"currentlyCritical" -> <|
	   "projected"-> If[Evaluate[params["Population"]*(CCq[t])/.sol][[1]] < 1, Null, Evaluate[params["Population"]*(CCq[t])/.sol][[1]]],
	   "lci"-> If[Evaluate[params["Population"]*(CCq[t])/.lcisol][[1]] < 1, Null, Evaluate[params["Population"]*(CCq[t])/.lcisol][[1]]],
	   "uci" -> If[Evaluate[params["Population"]*(CCq[t])/.ucisol][[1]] < 1, Null, Evaluate[params["Population"]*(CCq[t])/.ucisol][[1]]]
	|>
	(* only go from the lci importtime *) 
	}]],{t,Ceiling[lciuci["importtime"][[1]]],endOfEval}];
	
    summary=<|
	"totalProjectedDeaths"->If[KeyExistsQ[events, "containment"],Evaluate[params["Population"]*Deaq[t]/.sol/.{t->events["containment"][[1]][[1]]}][[1]], Evaluate[params["Population"]*Deaq[t]/.sol/.{t->endOfEval}][[1]]] ,"totalProjectedPCRConfirmed"->If[KeyExistsQ[events, "containment"],
	Evaluate[params["Population"]*PCR[t]/.sol][[1]]/.{t->events["containment"][[1]][[1]]},
	 Evaluate[params["Population"]*PCR[t]/.sol][[1]]/.{t->endOfEval}],
	"totalProjectedInfected"->If[KeyExistsQ[events, "containment"],Evaluate[(RSq[t]+RHq[t]+RCq[t])/.sol][[1]]/.{t->events["containment"][[1]][[1]]},
	Evaluate[(RSq[t]+RHq[t]+RCq[t])/.sol][[1]]/.{t->endOfEval}],
	"Fatality Rate"->If[KeyExistsQ[events, "containment"],Evaluate[(Deaq[t]/(RSq[t]+RHq[t]+RCq[t]))/.sol][[1]]/.{t->events["containment"][[1]][[1]]}, Evaluate[(Deaq[t]/(RSq[t]+RHq[t]+RCq[t]))/.sol][[1]]/.{t->endOfEval}],
	"Fatality Rate (PCR)"->If[KeyExistsQ[events, "containment"],
	Evaluate[(Deaq[t]/PCR[t])/.sol][[1]]/.{t->events["containment"][[1]][[1]]}, 
	Evaluate[(Deaq[t]/PCR[t])/.sol][[1]]/.{t->endOfEval}],
	"Date Contained"->If[KeyExistsQ[events, "containment"],
	DateString[DatePlus[{2020,1,1},events["containment"][[1]][[1]]-1]], 
	"Not Contained"],
	"Date ICU Over Capacity"->If[KeyExistsQ[events, "icu"]&&(!KeyExistsQ[events, "containment"]||(events["icu"][[1]][[1]]-events["containment"][[1]][[1]])<=0),DateString[DatePlus[{2020,1,1},events["icu"][[1]][[1]]-1]],"ICU Under capacity"],
	"Date Hospitals Over Capacity"->If[KeyExistsQ[events, "hospital"]&&(!KeyExistsQ[events, "containment"]||(events["hospital"][[1]][[1]]-events["containment"][[1]][[1]])<=0),DateString[DatePlus[{2020,1,1},events["hospital"][[1]][[1]]-1]],"Hospitals Under capacity"]|>;
    
	Association[{
	  "timeSeriesData"->timeSeriesData,
	  "events"->events,
	  "summary"->summary
    }]
];

(* define scenario associations, days is required, level is optional if you maintain, need to flag maintain *)
(* maintain takes the last day of data from the historicals and uses that as the distancing level *)
(* TODO: add test and trace scenario where there is a postDistancingLevel of r0=1 (we wont have access to fit r0 at this point... *)
scenario1=<|"id"->"scenario1","distancingDays"->90,"maintain"->True|>;
scenario2=<|"id"->"scenario2","distancingDays"->90,"distancingLevel"->0.4,"maintain"->False|>;
scenario3=<|"id"->"scenario3","distancingDays"->60,"distancingLevel"->0.11,"maintain"->False|>;
scenario4=<|"id"->"scenario4","distancingDays"->90,"distancingLevel"->1,"maintain"->False|>;
(*scenario5=<|"id"->"scenario5","distancingDays"->90,"distancingLevel"->0.11,"postDistancingLevel"->1,"maintain"->False|>;*)

scenarios={scenario1,scenario2,scenario3,scenario4};

scenarioFor[name_] := Select[scenarios,#["id"]== name&][[1]];

(* evaluate state for all scenarios *)
evaluateState[state_]:= Module[{distance,sol,params,longData,thisStateData,model,fit,fitParams,lciuci,icuCapacity,t,dataWeights},
    (* fit R0 / import time per state, then forecast each scenario *)
    params=stateParams[state,pC0,pH0,medianHospitalizationAge0,ageCriticalDependence0,ageHospitalizedDependence0];
	icuCapacity=params["icuBeds"]/params["Population"];
	thisStateData=Select[parsedData,(#["state"]==state&&#["positive"]>0)&];
	
    (* just do the fit to scenario1, the fit happens on points that are in the past, sot he future scenario doesn't impact *)
	distance[t_] := stateDistancing[state,scenario1,t];
	
	sol=CovidModelFit[
	daysUntilNotInfectiousOrHospitalized0,
	daysFromInfectedToInfectious0,
	daysUntilNotInfectiousOrHospitalized0,
	daysToLeaveHosptialNonCritical0,
	pPCRNH0,
	pPCRH0,
	daysTogoToCriticalCare0,
	daysFromCriticalToRecoveredOrDeceased0,
	fractionOfCriticalDeceased0,
	importlength0,
	initialInfectionImpulse0,
	tmax,
	params["pS"],
	params["pH"],
	params["pC"],
	distance,
	icuCapacity
	];

    model[r0natural_,importtime_][i_,t_]:=Through[sol[r0natural,importtime][t],List][[i]]/;And@@NumericQ/@{r0natural,importtime,i,t};
	
	(* we make the data shape (metric#, day, value) so that we can simultaneously fit PCR and deaths *)
	longData=Select[Join[
	  {1,#["day"],If[TrueQ[#["deathIncrease"]==Null],0,(#["deathIncrease"]/params["Population"])//N]}&/@thisStateData,
	  {2,#["day"],(#["positiveIncrease"]/params["Population"])//N}&/@thisStateData
	],#[[3]]>0&];
	
	(* weight the death numbers higher than pcr *)
	dataWeights = Join[
	   (1)&/@(Select[longData, #[[1]] == 1&]),
	   (0.1)&/@(Select[longData, #[[1]] == 2&])
	  ];

	(* Switch to nminimize, if we run into issues with the multi-fit not respecting weights *)
	(* confidence interval we get from doing the log needs to be back-transformed *)
	(* unclear how easy it is to get parameter confidence intervals from nminmize *)
	fit=NonlinearModelFit[
		longData,
		(* fit to daily increases *) 
		(* TODO log the model and log the data *)
		model[r0natural,importtime][i,t] - model[r0natural,importtime][i,t-1], 
		{{r0natural, Log[r0natural0]}, {importtime, Log[params["importtime0"]]}},
		{i,t},
		Weights -> dataWeights
	];
	(* if we cannot get smooth enough then use Nelder-Mead Post-processing \[Rule] false *)
	
	lciuci={Exp[#[[1]]],Exp[#[[2]]]}&/@KeyMap[ToString[#]&, AssociationThread[{r0natural,importtime},
	     fit["ParameterConfidenceIntervals",
	     ConfidenceLevel->0.97]]];
	fitParams=Exp[#]&/@KeyMap[ToString[#]&, Association[fit["BestFitParameters"]]];

	(* do a monte carlo for each scenario *)
    Merge[{
      Association[{#["id"]->evaluateScenario[state,fitParams,lciuci,#]}]&/@scenarios,
      <|"parameterCI"->lciuci,
	  "parameterBest"->fitParams|>,
      KeyDrop[stateParams[state, pC0,pH0,medianHospitalizationAge0,ageCriticalDependence0,ageHospitalizedDependence0],{"R0","importtime0"}],
      "R0"->fitParams["r0natural"],
      "importtime"->fitParams["importtime"],
      "longData"->longData
    }, First]
   
];

(* export the full model data, Warning: paralllize will eat a lot of laptop resources while it evaluates *)
evaluateStateAndPrint[state_]:=Module[{},
  Print["generating data for " <> state];
  evaluateState[state]
];
GenerateModelExport[] := Module[{allStateData},
allStateData=Parallelize[
Map[{#->evaluateStateAndPrint[#]}&,distancingStates]];
Export["public/json/model.json",Association[allStateData]]
]
