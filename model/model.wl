(* ::Package:: *)

(** Model parameters. See https://docs.google.com/spreadsheets/d/1DH58EFf_YkWHa_zn8-onBGzsYFMamjSjOItr137vu9g/edit#gid=0 **)
SetDirectory[$UserDocumentsDirectory<>"/Github/covidmodel"];

Import["model/data.wl"];
Import["model/plot-utils.wl"];

(* model predict max *)
tmax = 5*365;

(*Rate of progressing to infectiousness, days*)
daysFromInfectedToInfectious0 = 2.8;

(*Rate of losing infectiousness or going to the hospital, weeks*)
daysUntilNotInfectiousOrHospitalized0 = 2.5;

(*Rate of leaving hospital for those not going to critical care, weeks*)
daysToLeaveHosptialNonCritical0 = 8;

(*Rate of leaving hospital and going to critical care, weeks*)
daysTogoToCriticalCare0 = 6;

(*Rate of leaving critical care, weeks*)
daysFromCriticalToRecoveredOrDeceased0 = 6;

pPCRH0 = 0.8;
pPCRNH0 = 0.08;

(* How out of date are reports of hospitalizations? *)
daysForHospitalsToReportCases0 = 2;

daysToGetTestedIfNotHospitalized0 = 5.5;
daysToGetTestedIfHospitalized0 = 1.5;
 
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

(* less than 100 cases in a country the size of the US *)
containmentThresholdRatio0 = 100/USAPopulation;

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
hospitalCapacity_:1000000 (*defaulted since we dont evaluate this on a country basis yet *)
]:=
Reap[ParametricNDSolveValue[{
	
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
	WhenEvent[CCq[t]>=icuCapacity,Sow[{t,CCq[t]},"icu"]], (* ICU Capacity overshot *)
	WhenEvent[HHq[t]>=hospitalCapacity,Sow[{t,HHq[t]},"hospital"]],(* Hospitals Capacity overshot *)
	WhenEvent[t>=importtime , est[t]->Exp[-initialInfectionImpulse]], 
	WhenEvent[t >importtime+importlength, est[t]->0 ],
	Sq[0] ==1, Eq[0]==0,ISq[0]==0,RSq[0]==0,IHq[0]==0,
	HHq[0]==0,RepHq[0]==0,RHq[0]==0,ICq[0]==0,HCq[0]==0,CCq[0]==0,RCq[0]==0,Deaq[0]==0,est[0]==0,PCR[0]==0,
	EHq[0]==0
	},
	{Sq, Eq, ISq, RSq, IHq, HHq, RHq, RepHq, Iq,ICq, EHq, HCq, CCq, RCq,Deaq,PCR,est},
	{t, 0, tmax},
	{r0natural, importtime}
],{"containment","icu","hospital"},Rule];


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
containmentThresholdCases_,
icuCapacity_,
distancing_,
hospitalCapacity_:1000000 (*defaulted since we dont evaluate this on a country basis yet *)
]:=
Reap[ParametricNDSolveValue[{
	
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
	WhenEvent[RSq[t]+RSq[t]+RCq[t] >= 0.8, Sow[{t,RSq[t]+RSq[t]+RCq[t]},"herd"]], (* we assume herd immunity at 80% infected (may be high) but used to cut off calculation *)
	WhenEvent[CCq[t]>=icuCapacity,Sow[{t,CCq[t]},"icu"]], (* ICU Capacity overshot *)
	WhenEvent[HHq[t]>=hospitalCapacity,Sow[{t,HHq[t]},"hospital"]],(* Hospitals Capacity overshot *)
	WhenEvent[t>=importtime , est[t]->Exp[-initialInfectionImpulse]], 
	WhenEvent[t >importtime+importlength, est[t]->0 ],
	Sq[0] ==1, Eq[0]==0,ISq[0]==0,RSq[0]==0,IHq[0]==0,
	HHq[0]==0,RepHq[0]==0,RHq[0]==0,ICq[0]==0,HCq[0]==0,CCq[0]==0,RCq[0]==0,Deaq[0]==0,est[0]==0,PCR[0]==0,
	EHq[0]==0
	},
	{PCR, Deaq, Sq, Eq, ISq, RSq, IHq, HHq, RHq, RepHq, Iq,ICq, EHq, HCq, CCq, RCq, est},
	{t, 0, tmax},
	{r0natural, importtime}
],{"containment","herd","icu","hospital"},Rule];

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
"R0"-> If[KeyExistsQ[Association[Select[stateDistancingData,#["state"]==state&]],"baseline"],Association[Select[stateDistancingData,#["state"]==state&]]["baseline"]*r0natural0/100,r0natural0],
"pS"->Sum[noCare[a, medianHospitalizationAge, pCLimit,pHLimit,ageCriticalDependence,ageHospitalizedDependence ]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pH"->Sum[infectedHospitalized[a, medianHospitalizationAge, pHLimit,ageHospitalizedDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pC"->Sum[infectedCritical[a, medianHospitalizationAge, pCLimit,ageCriticalDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}]|>
];

(* TODO: should get the fit first and then evaluate scenario -- in this case the same fit is duplicated 4 times *)
evaluateScenario[state_, scenario_]:=Module[{distance,sol,params,longData,thisStateData,model,fit,lciuci,lci,uci,t,estimate},
	params=stateParams[state,pC0,pH0,medianHospitalizationAge0,ageCriticalDependence0,ageHospitalizedDependence0];
	thisStateData=Select[parsedData,(#["state"]==state&&#["positive"]>0)&];
	icuCapacity=params["icuBeds"]/params["Population"];
	hospitalCapacity=(1-params["bedUtilization"])*params["staffedBeds"]/params["Population"];
	hospitalizationData = stateHospitalizationData[state];
	distance[t_] := stateDistancing[state,scenario,t];
	
	baseline=distance[1];
	
	{sol,evts}=CovidModelFit[
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
	containmentThresholdRatio0,
	icuCapacity,
	distance,
	hospitalCapacity
	];
	
	events=Association[Flatten[evts]];
	
	model[r0natural_,importtime_][i_,t_]:=Through[sol[r0natural,importtime][t],List][[i]]/;And@@NumericQ/@{r0natural,importtime,i,t};
	
	(* we make the data shape (metric#, day, value) so that we can simultaneously fit PCR and deaths *)
	longData=Select[Join[
	{1,#["day"],(#["positive"]/params["Population"])//N}&/@thisStateData,
	{2,#["day"],If[TrueQ[#["death"]==Null],0,(#["death"]/params["Population"])//N]}&/@thisStateData],#[[3]]>0&
	];
	
	fit=NonlinearModelFit[longData, model[r0natural,importtime][i,t], {{r0natural, r0natural0},{importtime, params["importtime0"]}},{i,t}];
	metrics={PCR,Deaq,Sq, Eq, ISq, RSq, IHq, HHq, RHq, RepHq, Iq,ICq, EHq, HCq, CCq, RCq, est};
	lciuci=AssociationThread[{r0natural,importtime},fit["ParameterConfidenceIntervals",ConfidenceLevel->0.90]];
	lci[metric_,t_]:=model[(r0natural/.lciuci)[[1]],(importtime/.lciuci)[[1]]][Position[metrics,metric][[1]][[1]],t];
	uci[metric_,t_]:=model[(r0natural/.lciuci)[[2]],(importtime/.lciuci)[[2]]][Position[metrics,metric][[1]][[1]],t];
	estimate[metric_,t_]:=fit[Position[metrics,metric][[1]][[1]],t];
	
	endOfYear = 365;
	endOfEval = If[KeyExistsQ[events, "containment"], events["containment"][[1]][[1]], If[KeyExistsQ[events,"herd"],  events["herd"][[1]][[1]],endOfYear]];
	
	(* TODO: we should chop off the data here with one of either a containment or herd immunity event to prevent evaluating at points that are too close
	to avoid stiff system warnings *)
	
	timeSeriesData=Table[Module[{},
	Association[{
	"day"->t,
	"distancing"->(distance[t]/baseline),
	"confirmedDeaths"->If[Length[Select[thisStateData,(#["day"]==t)&]]!=1,0,Select[thisStateData,(#["day"]==t)&][[1]]["death"]],
	"confirmedPcr"->If[Length[Select[thisStateData,(#["day"]==t)&]]!=1,0,Select[thisStateData,(#["day"]==t)&][[1]]["positive"]],
	"confirmedHospitalizations"->If[Length[Select[hospitalizationData,(#["day"]==t)&]]!=1,0,Select[hospitalizationData,(#["day"]==t)&][[1]]["hospitalizations"]],
	
	"projectedPcrLCI"->params["Population"]*lci[PCR,t],
	"projectedPcr"->params["Population"]*estimate[PCR,t],
	"projectedPcrUCI"->params["Population"]*uci[PCR,t],
	
	"projectedDeathsLCI"->params["Population"]*estimate[Deaq,t],
	"projectedDeaths"->params["Population"]*estimate[Deaq,t],
	"projectedDeathsUCI"->params["Population"]*estimate[Deaq,t];
	
	"projectedCurrentlyInfectedLCI"->params["Population"]*lci[Eq,t],
	"projectedCurrentlyInfected"->params["Population"]*estimate[Eq,t],
	"projectedCurrentlyInfectedUCI"->params["Population"]*uci[Eq,t],
	
	"projectedCurrentlyInfectiousLCI"->params["Population"]*lci[Eq,t],
	"projectedCurrentlyInfectious"->params["Population"]*estimate[Iq,t],
	"projectedCurrentlyInfectiousUCI"->params["Population"]*uci[Eq,t],
	
	"projectedCumulativeInfectionsLCI"->params["Population"]*(lci[RSq,t]+lci[RHq,t]+lci[RCq,t]),
	"projectedCumulativeInfections"->params["Population"]*(estimate[RSq,t]+estimate[RHq,t]+estimate[RCq,t]),
	"projectedCumulativeInfectionsUCI"->params["Population"]*(uci[RSq,t]+uci[RHq,t]+uci[RCq,t]),
	
	"projectedCurrentlyHospitalizedLCI"->params["Population"]*lci[HHq,t],
	"projectedCurrentlyHospitalized"->params["Population"]*estimate[HHq,t],
	"projectedCurrentlyHospitalizedUCI"->params["Population"]*uci[HHq,t],
	
	"projectedCurrentlyCriticalLCI"->params["Population"]*lci[CCq,t],
	"projectedCurrentlyCritical"->params["Population"]*lci[CCq,t],
	"projectedCurrentlyCriticalUCI"->params["Population"]*lci[CCq,t]
	}]],{t,0,endOfEval}];
	
	summary=<|
	"parameterCI"->KeyMap[ToString[#]&,lciuci],
	"parameterBest"->KeyMap[ToString[#]&,Association[fit["BestFitParameters"]]],
	"totalProjectedDeaths"->If[KeyExistsQ[events, "containment"],params["Population"]*estimate[Deaq, events["containment"][[1]][[1]]], params["Population"]*estimate[Deaq,endOfYear]],
	"totalProjectedPCRConfirmed"->If[KeyExistsQ[events, "containment"],
	  params["Population"]*estimate[PCR, events["containment"][[1]][[1]]],
	  params["Population"]*estimate[PCR, endOfYear]],
	"totalProjectedInfected"->If[KeyExistsQ[events, "containment"],
	  (estimate[RSq,events["containment"][[1]][[1]]]+estimate[RHq,events["containment"][[1]][[1]]]+estimate[RCq,events["containment"][[1]][[1]]]),
	  (estimate[RSq,endOfYear]+estimate[RHq,endOfYear]+estimate[RCq,endOfYear])],
	"Fatality Rate"->If[KeyExistsQ[events, "containment"],
	 (estimate[Deaq,events["containment"][[1]][[1]]]/(estimate[RSq,events["containment"][[1]][[1]]]+estimate[RHq,events["containment"][[1]][[1]]]+estimate[RCq,events["containment"][[1]][[1]]])), 
	 (estimate[Deaq,endOfYear]/(estimate[RSq,endOfYear]+estimate[RHq,endOfYear]+estimate[RCq,endOfYear]))],
	"Fatality Rate (PCR)"->If[KeyExistsQ[events, "containment"],
	  (estimate[Deaq,events["containment"][[1]][[1]]]/estimate[PCR,events["containment"][[1]][[1]]]),
	  (estimate[Deaq,endOfYear]/estimate[PCR,endOfYear])],
	"Date Contained"->If[KeyExistsQ[events, "containment"],
	  DateString[DatePlus[{2020,1,1},events["containment"][[1]][[1]]-1]], 
	  "Not Contained"],
	"Date ICU Over Capacity"->If[KeyExistsQ[events, "icu"]&&(!KeyExistsQ[events, "containment"]||(events["icu"][[1]][[1]]-events["containment"][[1]][[1]])<=0),DateString[DatePlus[{2020,1,1},events["icu"][[1]][[1]]-1]],"ICU Under capacity"],
	"Date Hospitals Over Capacity"->If[KeyExistsQ[events, "hospital"]&&(!KeyExistsQ[events, "containment"]||(events["hospital"][[1]][[1]]-events["containment"][[1]][[1]])<=0),DateString[DatePlus[{2020,1,1},events["hospital"][[1]][[1]]-1]],"Hospitals Under capacity"]|>;

	Association[{
	  "timeSeriesData"->timeSeriesData,
	  "summary"->summary
    }]
];

(* define scenario associations, days is required, level is optional if you maintain, need to flag maintain *)
(* maintain takes the last day of data from the historicals and uses that as the distancing level *)
(* TODO: add test and trace scenario where there is a postDistancingLevel of r0=1 (we wont have access to fit r0 at this point... *)
scenario1=<|"id"->"scenario1","distancingDays"->90,"maintain"->True|>;
scenario2=<|"id"->"scenario2","distancingDays"->90,"distancingLevel"->0.4,"maintain"->False|>;
scenario3=<|"id"->"scenario3","distancingDays"->90,"distancingLevel"->0.11,"maintain"->False|>;
scenario4=<|"id"->"scenario4","distancingDays"->90,"distancingLevel"->1,"maintain"->False|>;

scenarios={scenario1,scenario2,scenario3,scenario4};

(* evaluate state for all scenarios *)
evaluateState[state_]:=Merge[
{Association[{#["id"]->evaluateScenario[state,#]}]&/@scenarios,
stateParams[state, pC0,pH0,medianHospitalizationAge0,ageCriticalDependence0,ageHospitalizedDependence0]},
First
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
