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
daysFromCriticalToRecoveredOrDeceased0 = 10;

(* probabilities of getting pcr confirmations given hospitalized / non-hospitalized resp *)
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

(*Probability of 100 year being hospitalized*)
pHospitalized100Yo = 0.25;
(*Probability of 100 year old needing critical care*)
pCriticalGivenHospitalized100Yo = 0.3;

(*Probability of needing critical care*)
pC0 = pCriticalGivenHospitalized100Yo*pHospitalized100Yo;

(*Probability of hospitalization but not critical care*)
pH0 = (1-pCriticalGivenHospitalized100Yo)*pHospitalized100Yo;

(*Probability of not needing care*)
pS0 = 1-(pC0 + pH0);

(** Utils **)
today=QuantityMagnitude[DateDifference[DateList[{2020,1,1}],Today]];

(* define scenario associations, days is required, level is optional if you maintain, need to flag maintain *)
(* maintain takes the last day of data from the historicals and uses that as the distancing level *)
(* TODO: add test and trace scenario where there is a postDistancingLevel of r0=1 (we wont have access to fit r0 at this point... *)
scenario1=<|"id"->"scenario1","distancingDays"->90,"maintain"->True,"name"->"Current"|>;
scenario2=<|"id"->"scenario2","distancingDays"->90,"distancingLevel"->0.4,"maintain"->False,"name"->"Italy"|>;
scenario3=<|"id"->"scenario3","distancingDays"->60,"distancingLevel"->0.11,"maintain"->False,"name"->"Wuhan"|>;
scenario4=<|"id"->"scenario4","distancingDays"->90,"distancingLevel"->1,"maintain"->False,"name"->"Normal"|>;
(*scenario5=<|"id"->"scenario5","distancingDays"->90,"distancingLevel"->0.11,"postDistancingLevel"->1,"maintain"->False|>;*)

scenarios={scenario1,scenario2,scenario3,scenario4};

(* helper to get the scenario for a given id *)
scenarioFor[name_] := Select[scenarios,#["id"]== name&][[1]];

(* define some helper distributions and set up all the parameters that need to be simulated *)
BetaMeanSig[mu_,sig_]:=BetaDistribution[(mu^2-mu^3-mu sig)/sig,((-1+mu) (-mu+mu^2+sig))/sig];
PosNormal[mu_,sig_]:=TruncatedDistribution[{0,\[Infinity]},NormalDistribution[mu,sig]]

(* a function to generate the monte carlo simulations from combo of fit / assumed parameters *)
generateSimulations[numberOfSimulations_, fitParams_, standardErrors_]:=<|
"daysFromInfectedToInfectious"->RandomVariate[PosNormal[daysFromInfectedToInfectious0,1]],
"daysUntilNotInfectiousOrHospitalized"-> RandomVariate[PosNormal[daysUntilNotInfectiousOrHospitalized0,0.5]],
"daysToLeaveHosptialNonCritical"-> RandomVariate[PosNormal[daysToLeaveHosptialNonCritical0,2]],
"daysTogoToCriticalCare"-> RandomVariate[PosNormal[daysTogoToCriticalCare0,1]],
"daysFromCriticalToRecoveredOrDeceased"-> RandomVariate[PosNormal[daysFromCriticalToRecoveredOrDeceased0,1]],
"pPCRH"->RandomVariate[NormalDistribution[pPCRH0,0.05]],
"pPCRNH"->RandomVariate[NormalDistribution[pPCRNH0,0.02]],
"daysForHospitalsToReportCases"->RandomVariate[PosNormal[daysForHospitalsToReportCases0,0.3]],
"daysToGetTestedIfNotHospitalized"->RandomVariate[PosNormal[daysToGetTestedIfNotHospitalized0,1]],
"daysToGetTestedIfHospitalized"->RandomVariate[PosNormal[daysToGetTestedIfHospitalized0,0.3]],
"icuOverloadDeathPenalty0"->RandomVariate[PosNormal[icuOverloadDeathPenalty0,0.5]],
"initialInfectionImpulse"->RandomVariate[PosNormal[initialInfectionImpulse0,3]],
"importlength"->RandomVariate[PosNormal[importlength0,1]],
"fractionOfCriticalDeceased"->RandomVariate[BetaMeanSig[fractionOfCriticalDeceased0,0.02]],
"r0natural"->RandomVariate[PosNormal[fitParams["r0natural"],standardErrors["r0natural"]]],
"importtime"->RandomVariate[PosNormal[fitParams["importtime"],standardErrors["importtime"]]]
|>&/@Range[numberOfSimulations];

(* Assumption here is that age dependence follows a logistic curve -- zero year olds dont require any care, 
100 year olds require significant case, midpoint is the medianHospitalization age *)
infectedCritical[a_,medianHospitalizationAge_,pCLimit_,ageCriticalDependence_] := 
	pCLimit/(1+Exp[-((a-medianHospitalizationAge)/ageCriticalDependence)]);

infectedHospitalized[a_,medianHospitalizationAge_,pHLimit_,ageHospitalizedDependence_] :=
	pHLimit/(1+Exp[-((a-medianHospitalizationAge)/ageHospitalizedDependence)]);

noCare[a_,medianHospitalizationAge_,pCLimit_, pHLimit_,ageCriticalDependence_,ageHospitalizedDependence_] := 
	1-infectedCritical[a, medianHospitalizationAge, pCLimit,ageCriticalDependence]-
	infectedHospitalized[a, medianHospitalizationAge,pHLimit, ageHospitalizedDependence];

stateParams[state_, pCLimit_,pHLimit_,medianHospitalizationAge_,ageCriticalDependence_,ageHospitalizedDependence_]:=Module[{raw,pop,dist,buckets},
raw = stateRawDemographicData[state];
pop = raw["Population"];
dist = raw["Distribution"];
buckets = raw["Buckets"];

(*return a map of per state params to values *)
<|"population"->pop,
"importtime0"->If[!KeyExistsQ[stateImportTime, state],Min[#["day"]&/@Select[parsedData,(#["state"]==state&&#["positive"]>=50)&]] - 20,stateImportTime[state]], (* importtime 20 days before 50 PCR confirmed reached *)
"ventilators"->ventilators[state],
"icuBeds"->stateICUData[state]["icuBeds"],
"staffedBeds"->stateICUData[state]["staffedBeds"],
"bedUtilization"->stateICUData[state]["bedUtilization"],
"hospitalCapacity"->(1-stateICUData[state]["bedUtilization"])*stateICUData[state]["staffedBeds"],
"R0"-> stateDistancing[state,scenario1,1]*(r0natural0/100),
"pS"->Sum[noCare[a, medianHospitalizationAge, pCLimit,pHLimit,ageCriticalDependence,ageHospitalizedDependence ]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pH"->Sum[infectedHospitalized[a, medianHospitalizationAge, pHLimit,ageHospitalizedDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pC"->Sum[infectedCritical[a, medianHospitalizationAge, pCLimit,ageCriticalDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}]|>
];


(* Define the model to be evaulated in the simulations -- 
all parameters are given either from the Monte-Carlo draws or evaluting the means *)
(* This defines an enriched SEIR model with extra states for things like PCR confirmation and fatalities *)
(* It also fires several events for things like when the hospital / icu capacities are exceeded so that
those don't have to be computed manually later *)

(* functions in the model are:
Sq - the currently susceptible population

Eq - the currently infected population

Iq - the currently infectious population
ISq - infectious and no care needed
IHq - infectious and in hospitalized non-ciritcal condition
ICq - infectious and in critical condition

PCR - cumulative PCR confirmations

RSq - recovered without needing care

RepHq - hospitalized patient reported in data
EHq - cumulative hospitalized patients
HHq - hospitalized patients (actual)
RHq - recovered from hospital without critical care

HCq - hospitalized and in need of critical care
CCq - in ciritcal care
RCq - recovered from critical care
Deaq - passed after critical care

est - initial infection impulse (eg from imported cases at importtime)
*)
CovidModel[distancing_, endOfEval_]:= ParametricNDSolve[{
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
	WhenEvent[Iq[t] <= 1,Sow[{t,Iq[t]},"cutoff"]] (* dont bother running when active infections less than 100 it can lead to evaluation issues in long tail simulations *),
	WhenEvent[HHq[t]>=hospitalCapacity,Sow[{t,HHq[t]},"hospital"]],(* Hospitals Capacity overshot *)
	WhenEvent[t>=importtime , est[t]->Exp[-initialInfectionImpulse]], 
	WhenEvent[t >importtime+importlength, est[t]->0 ],
	Sq[0] ==1, Eq[0]==0,ISq[0]==0,RSq[0]==0,IHq[0]==0,
	HHq[0]==0,RepHq[0]==0,RHq[0]==0,ICq[0]==0,HCq[0]==0,CCq[0]==0,RCq[0]==0,Deaq[0]==0,est[0]==0,PCR[0]==0,
	EHq[0]==0
	},
	{Sq, Eq, ISq, RSq, IHq, HHq, RHq, RepHq, Iq,ICq, EHq, HCq, CCq, RCq,Deaq,PCR, est},
	{t, 0, 150},
	{r0natural,
daysUntilNotInfectiousOrHospitalized,
daysFromInfectedToInfectious,
daysUntilNotInfectiousOrHospitalized,
daysToLeaveHosptialNonCritical,
pPCRNH,
pPCRH,
daysTogoToCriticalCare,
daysFromCriticalToRecoveredOrDeceased,
fractionOfCriticalDeceased,
importtime,
importlength,
initialInfectionImpulse,
pS,
pH,
pC,
containmentThresholdCases,
icuCapacity,
hospitalCapacity}];

(* this is a modified version of CovidModel that does not take an r0 or importtime value, but isntead returns a parametric
ndsolve which is used later to fit those parameters against data *)
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



(* Given a set fit parameters, simulated parameters and a definition of a scenario,
run all the simulations and produce the quantiles for the mean and confidence band estimates *)
evaluateScenario[state_, fitParams_, sims_, stateParams_, scenario_]:=Module[{
    distance,
    sol,
    evts,
    timeSeriesData,
    summary,
    simResults,
    perSimulationEvents,
    endOfYear,
    events,
    endOfEval,herdTime,
    PCRQuantiles, DeathQuantiles, CurrentlyReportedHospitalizedQuantiles, CurrentlyInfectedQuantiles, CurrentlyInfectiousQuantiles, CumulativeInfectionQuantiles, CurrentlyHospitalizedQuantiles, CurrentlyCriticalQuantiles,
    deciles,
    containmentTime,
	hospitalOverloadTime,
	icuOverloadTime,
	resultsPCR,
resultsDeaq,
resultsRepHq,
resultsEq,
resultsIq,
resultsRSq,
resultsRHq,
resultsRCq,
resultsHHq,
resultsCCq
    },
    
	distance[t_] := stateDistancing[state, scenario, t];
	
	(* do one solution with the mean param values for the estimate *)
	{sol,evts}=Reap[CovidModel[
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
	stateParams["params"]["pS"],
	stateParams["params"]["pH"],
	stateParams["params"]["pC"],
	containmentThresholdRatio0,
	stateParams["icuCapacity"],
	distance,
	stateParams["hospitalCapacity"]
	]];
	
	events=Association[Flatten[evts]];
	endOfYear = 365;
	(* we  chop off the data here with one of either a containment or herd immunity events *)
	endOfEval = If[KeyExistsQ[events, "containment"], events["containment"][[1]][[1]], 
		If[KeyExistsQ[events, "cutoff"], events["cutoff"][[1]][[1]],
	    endOfYear]];
	
	
	{soltime,sol} = AbsoluteTiming[CovidModel[distance,endOfEval]];
    
{makeinterptime, resultsPCR} = AbsoluteTiming[AbsoluteTiming[PCR[
    #["r0natural"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysFromInfectedToInfectious"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysToLeaveHosptialNonCritical"],
    #["pPCRNH"],
    #["pPCRH"],
    #["daysTogoToCriticalCare"],
    #["daysFromCriticalToRecoveredOrDeceased"],
    #["fractionOfCriticalDeceased"],
    #["importtime"],
    #["importlength"],
    #["initialInfectionImpulse"],
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    containmentThresholdRatio0,
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"]
]/.sol]&/@sims];

(*resultsDeaq = Deaq[
    #["r0natural"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysFromInfectedToInfectious"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysToLeaveHosptialNonCritical"],
    #["pPCRNH"],
    #["pPCRH"],
    #["daysTogoToCriticalCare"],
    #["daysFromCriticalToRecoveredOrDeceased"],
    #["fractionOfCriticalDeceased"],
    #["importtime"],
    #["importlength"],
    #["initialInfectionImpulse"],
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    containmentThresholdRatio0,
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"]
]/.sol&/@sims;

resultsRepHq = RepHq[
    #["r0natural"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysFromInfectedToInfectious"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysToLeaveHosptialNonCritical"],
    #["pPCRNH"],
    #["pPCRH"],
    #["daysTogoToCriticalCare"],
    #["daysFromCriticalToRecoveredOrDeceased"],
    #["fractionOfCriticalDeceased"],
    #["importtime"],
    #["importlength"],
    #["initialInfectionImpulse"],
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    containmentThresholdRatio0,
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"]
]/.sol&/@sims;

resultsEq = Eq[
    #["r0natural"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysFromInfectedToInfectious"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysToLeaveHosptialNonCritical"],
    #["pPCRNH"],
    #["pPCRH"],
    #["daysTogoToCriticalCare"],
    #["daysFromCriticalToRecoveredOrDeceased"],
    #["fractionOfCriticalDeceased"],
    #["importtime"],
    #["importlength"],
    #["initialInfectionImpulse"],
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    containmentThresholdRatio0,
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"]
]/.sol&/@sims;

resultsIq = Iq[
    #["r0natural"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysFromInfectedToInfectious"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysToLeaveHosptialNonCritical"],
    #["pPCRNH"],
    #["pPCRH"],
    #["daysTogoToCriticalCare"],
    #["daysFromCriticalToRecoveredOrDeceased"],
    #["fractionOfCriticalDeceased"],
    #["importtime"],
    #["importlength"],
    #["initialInfectionImpulse"],
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    containmentThresholdRatio0,
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"]
]/.sol&/@sims;

resultsRSq = RSq[
    #["r0natural"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysFromInfectedToInfectious"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysToLeaveHosptialNonCritical"],
    #["pPCRNH"],
    #["pPCRH"],
    #["daysTogoToCriticalCare"],
    #["daysFromCriticalToRecoveredOrDeceased"],
    #["fractionOfCriticalDeceased"],
    #["importtime"],
    #["importlength"],
    #["initialInfectionImpulse"],
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    containmentThresholdRatio0,
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"]
]/.sol&/@sims;

resultsRHq = RHq[
    #["r0natural"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysFromInfectedToInfectious"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysToLeaveHosptialNonCritical"],
    #["pPCRNH"],
    #["pPCRH"],
    #["daysTogoToCriticalCare"],
    #["daysFromCriticalToRecoveredOrDeceased"],
    #["fractionOfCriticalDeceased"],
    #["importtime"],
    #["importlength"],
    #["initialInfectionImpulse"],
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    containmentThresholdRatio0,
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"]
]/.sol&/@sims;

resultsRCq = RCq[
    #["r0natural"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysFromInfectedToInfectious"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysToLeaveHosptialNonCritical"],
    #["pPCRNH"],
    #["pPCRH"],
    #["daysTogoToCriticalCare"],
    #["daysFromCriticalToRecoveredOrDeceased"],
    #["fractionOfCriticalDeceased"],
    #["importtime"],
    #["importlength"],
    #["initialInfectionImpulse"],
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    containmentThresholdRatio0,
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"]
]/.sol&/@sims;

resultsHHq = HHq[
    #["r0natural"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysFromInfectedToInfectious"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysToLeaveHosptialNonCritical"],
    #["pPCRNH"],
    #["pPCRH"],
    #["daysTogoToCriticalCare"],
    #["daysFromCriticalToRecoveredOrDeceased"],
    #["fractionOfCriticalDeceased"],
    #["importtime"],
    #["importlength"],
    #["initialInfectionImpulse"],
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    containmentThresholdRatio0,
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"]
]/.sol&/@sims;

resultsCCq = CCq[
    #["r0natural"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysFromInfectedToInfectious"],
    #["daysUntilNotInfectiousOrHospitalized"],
    #["daysToLeaveHosptialNonCritical"],
    #["pPCRNH"],
    #["pPCRH"],
    #["daysTogoToCriticalCare"],
    #["daysFromCriticalToRecoveredOrDeceased"],
    #["fractionOfCriticalDeceased"],
    #["importtime"],
    #["importlength"],
    #["initialInfectionImpulse"],
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    containmentThresholdRatio0,
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"]
]/.sol&/@sims;*)

(*
    deciles = {1/10,2/10,3/10,4/10,5/10,6/10,7/10,8/10,9/10};
	(* define functions to get the lci, mean, uci quantiles for each of the functions we want
	to produce time-series for *)
	PCRQuantiles[t_]:=Quantile[#[t]&/@resultsPCR, deciles];
    DeathQuantiles[t_]:=Quantile[#[t]&/@resultsDeaq, deciles];
	CurrentlyReportedHospitalizedQuantiles[t_]:=Quantile[#[t]&/@resultsRepHq, deciles];
	CurrentlyInfectedQuantiles[t_]:=Quantile[#[t]&/@resultsEq, deciles];
	CurrentlyInfectiousQuantiles[t_]:=Quantile[#[t]&/@resultsIq, deciles];
	CumulativeInfectionQuantiles[t_]:=Quantile[#[t]&/@resultsRSq + #[t]&/@resultsRHq + #[t]&/@resultsRCq, deciles];
	CurrentlyHospitalizedQuantiles[t_]:=Quantile[#[t]&/@resultsHHq, deciles];
	CurrentlyCriticalQuantiles[t_]:=Quantile[#[t]&/@resultsCCq, deciles];*)
	Print[soltime];
	Print[makeinterptime];
	
	resultsPCR
	
	(*timeSeriesData = Module[{},
	Table[Association[{
	"day"->t,
	"distancing"->distance[t],
	"cumulativePcr" -> Merge[{
	   <|"confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, Null, Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["positive"]]|>,
	   Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,PCRQuantiles[t]]]
	},First],
	"cumulativeDeaths" -> Merge[{
	   <|"confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, Null,Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["death"]]|>,
	   Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,DeathQuantiles[t]]]
	},First],
	"currentlyInfected" -> Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyInfectedQuantiles[t]]],
	"currentlyInfectious" -> Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyInfectiousQuantiles[t]]],
	"cumulativeInfections" -> Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CumulativeInfectionQuantiles[t]]],
	"currentlyReportedHospitalized" -> Merge[{
	   <|"confirmed"->If[Length[Select[stateParams["hospitalizationData"],(#["day"]==t)&]]!=1, Null,Select[stateParams["hospitalizationData"],(#["day"]==t)&][[1]]["hospitalizations"]]|>,
	   Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyReportedHospitalizedQuantiles[t]]]
	},First],
	"currentlyHospitalized" -> Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyHospitalizedQuantiles[t]]],
	"currentlyCritical" -> Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyCriticalQuantiles[t]]]
	}],{t,Floor[fitParams["importtime"]] - 5, endOfEval}]];
	
	containmentTime = If[KeyExistsQ[events, "containment"],events["containment"][[1]][[1]],Null];
	hospitalOverloadTime = If[KeyExistsQ[events, "hospital"],events["hospital"][[1]][[1]],Null];
	icuOverloadTime = If[KeyExistsQ[events, "icu"],events["icu"][[1]][[1]],Null];
	
     summary=<|
	"totalProjectedDeaths"->If[KeyExistsQ[events, "containment"],
	   DeathQuantiles[containmentTime][[5]],  
	   DeathQuantiles[endOfEval][[5]]],
	"totalProjectedPCRConfirmed"->If[KeyExistsQ[events, "containment"],
	  PCRQuantiles[containmentTime][[5]],
	  PCRQuantiles[endOfEval][[5]]],
	"totalProjectedInfected"->If[KeyExistsQ[events, "containment"],
	  CumulativeInfectionQuantiles[containmentTime][[5]],
	  CumulativeInfectionQuantiles[endOfEval][[5]]],
	"fatalityRate"->If[KeyExistsQ[events, "containment"],
	   (DeathQuantiles[containmentTime][[5]]/(CumulativeInfectionQuantiles[containmentTime][[5]])), 
	   DeathQuantiles[endOfEval][[5]]/(CumulativeInfectionQuantiles[endOfEval][[5]])],
	"fatalityRatePCR"->If[KeyExistsQ[events, "containment"],
	  DeathQuantiles[containmentTime][[5]]/PCRQuantiles[containmentTime][[5]], 
	  DeathQuantiles[endOfEval][[5]]/PCRQuantiles[endOfEval][[5]]],
	"dateContained"->If[KeyExistsQ[events, "containment"],
	  DateString[DatePlus[{2020,1,1},containmentTime-1]], 
	  Null],
	"dateICUOverCapacity"->If[KeyExistsQ[events, "icu"]&&(!KeyExistsQ[events, "containment"]||(icuOverloadTime - containmentTime)<=0),
	   DateString[DatePlus[{2020,1,1},icuOverloadTime-1]],
	   Null],
	"dateHospitalsOverCapacity"->If[KeyExistsQ[events, "hospital"]&&(!KeyExistsQ[events, "containment"]||(hospitalOverloadTime - containmentTime)<=0),
	   DateString[DatePlus[{2020,1,1},hospitalOverloadTime-1]],
	   Null]
	|>;
	
	Merge[{
	  scenario,
	  Association[{
	    "timeSeriesData"->timeSeriesData,
	    "events"->events,
	    "summary"->summary
      }]}, First]*)
];

(* evaluate state for all scenarios *)
(* we first fit the data on PCR and fatalities to find the R0 and importtime for that state
then we generate a set of all the simulated parameters. Finally we call evaluateScenario to run and aggregate the
simulation results for each scenario *)
evaluateState[state_]:= Module[{distance,sol,params,longData,thisStateData,model,fit,fitParams,lciuci,icuCapacity,t,dataWeights,standardErrors,hospitalizationData,hospitalCapacity,sims},
    (* fit R0 / import time per state, then forecast each scenario *)
    params=stateParams[state,pC0,pH0,medianHospitalizationAge0,ageCriticalDependence0,ageHospitalizedDependence0];
	icuCapacity=params["icuBeds"]/params["population"];
	thisStateData=Select[parsedData,(#["state"]==state&&#["positive"]>0)&];
	hospitalCapacity=(1-params["bedUtilization"])*params["staffedBeds"]/params["population"];
	hospitalizationData = stateHospitalizationData[state];
	
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
	  {1,#["day"],If[TrueQ[#["deathIncrease"]==Null],0,(#["deathIncrease"]/params["population"])//N]}&/@thisStateData,
	  {2,#["day"],(#["positiveIncrease"]/params["population"])//N}&/@thisStateData
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
		Weights -> dataWeights,
		AccuracyGoal->5,
		PrecisionGoal->10
	];
	
	(* if we cannot get smooth enough then use Nelder-Mead Post-processing \[Rule] false *)
	fitParams=Exp[#]&/@KeyMap[ToString[#]&, Association[fit["BestFitParameters"]]];
	standardErrors=Exp[#]&/@KeyMap[ToString[#]&, AssociationThread[{r0natural,importtime},
	     fit["ParameterErrors",
	     ConfidenceLevel->0.97]]];
	     
	sims=generateSimulations[10,fitParams,standardErrors];

	(* do a monte carlo for each scenario *)
    Merge[{
      <|"scenarios"->
         Association[{#["id"]->evaluateScenario[state,fitParams,sims,
         <|"params"->params,
           "thisStateData"->thisStateData,
           "icuCapacity"->icuCapacity,
           "hospitalCapacity"->hospitalCapacity, 
           "hospitalizationData"-> hospitalizationData
         |>, #]}&/@scenarios]|>,
      <|"parameterBest"->fitParams|>,
      KeyDrop[stateParams[state, pC0,pH0,medianHospitalizationAge0,ageCriticalDependence0,ageHospitalizedDependence0],{"R0","importtime0"}],
      "r0"->fitParams["r0natural"],
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


(* TODO: re-incorporate to validate assumed parameters *)

countryParams[country_, pCLimit_,pHLimit_,medianHospitalizationAge_,ageCriticalDependence_,ageHospitalizedDependence_] := 
	Module[{raw,pop,dist,buckets},
		raw = cachedAgeDistributionFor[country];
		pop = raw["Population"];
		dist = raw["Distribution"];
		buckets = raw["Buckets"];

(*return a map of per state params to values *)
<|"population"->pop,
"importtime0"->countryImportTime[country],
"ventilators"->countryVentilators[country],
"pS"->Sum[noCare[a, medianHospitalizationAge, pCLimit,pHLimit,ageCriticalDependence,ageHospitalizedDependence ]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pH"->Sum[infectedHospitalized[a, medianHospitalizationAge, pHLimit,ageHospitalizedDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pC"->Sum[infectedCritical[a, medianHospitalizationAge, pCLimit,ageCriticalDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}]|>
];
