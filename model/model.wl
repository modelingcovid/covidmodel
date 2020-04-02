(* ::Package:: *)

(** Model parameters. See https://docs.google.com/spreadsheets/d/1DH58EFf_YkWHa_zn8-onBGzsYFMamjSjOItr137vu9g/edit#gid=0 **)
SetDirectory[$UserDocumentsDirectory<>"/Github/covidmodel"];

Import["model/data.wl"];
Import["model/gof-metrics.wl"];
Import["model/plot-utils.wl"];

(* model predict max *)
tmax0 = 365;

(*Rate of progressing to infectiousness, days*)
daysFromInfectedToInfectious0 = 4;

(*Rate of losing infectiousness or going to the hospital*)
daysUntilNotInfectiousOrHospitalized0 = 5;

(*Rate of leaving hospital for those not going to critical care*)
daysToLeaveHosptialNonCritical0 = 8;

(*Rate of leaving hospital and going to critical care*)
daysTogoToCriticalCare0 = 4;

(*Rate of leaving critical care, weeks*)
daysFromCriticalToRecoveredOrDeceased0 = 10;

(* probabilities of getting pcr confirmations given hospitalized / non-hospitalized resp *)
pPCRH0 = 0.8;
pPCRNH0 = 0.05;

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
fractionOfCriticalDeceased0 = 0.4;

USAPopulation = (327.2*10^6);

(* less than 3000 cases in a country the size of the US *)
containmentThresholdRatio0 = 3000/USAPopulation;

(* interpret as: steepness of age depencence*)
medianHospitalizationAge0 = 61;

(* interpret as: steepness of age depencence*)
ageCriticalDependence0 = 3;
ageHospitalizedDependence0 = 5;

(*Probability of 100 year being hospitalized*)
pHospitalized100Yo = 0.25;
(*Probability of 100 year old needing critical care*)
pCriticalGivenHospitalized100Yo = 0.3;

(* percent positive test delay *)
percentPositiveTestDelay0 = 11;

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
generateSimulations[numberOfSimulations_, fitParams_, standardErrors_, cutoff_, stateParams_]:=Module[{},
  {
   RandomVariate[PosNormal[fitParams["r0natural"],standardErrors["r0natural"]]],
 RandomVariate[PosNormal[daysUntilNotInfectiousOrHospitalized0,daysUntilNotInfectiousOrHospitalized0*0.05]],
 RandomVariate[PosNormal[daysFromInfectedToInfectious0,daysFromInfectedToInfectious0*0.05]],
 RandomVariate[PosNormal[daysToLeaveHosptialNonCritical0,daysToLeaveHosptialNonCritical0*0.05]],
RandomVariate[PosNormal[fitParams["pPCRNH"],fitParams["pPCRNH"]*0.05]],
RandomVariate[PosNormal[fitParams["pPCRH"],fitParams["pPCRH"]*0.05]],
 RandomVariate[PosNormal[daysTogoToCriticalCare0,daysTogoToCriticalCare0*0.05]], 
 RandomVariate[PosNormal[daysFromCriticalToRecoveredOrDeceased0,daysFromCriticalToRecoveredOrDeceased0*0.05]],
RandomVariate[BetaMeanSig[fractionOfCriticalDeceased0,fractionOfCriticalDeceased0*0.02]],
RandomVariate[PosNormal[fitParams["importtime"],standardErrors["importtime"]]], 
RandomVariate[PosNormal[importlength0,importlength0*0.05]],
RandomVariate[PosNormal[initialInfectionImpulse0,initialInfectionImpulse0*0.05]],
cutoff,
stateParams["params"]["pS"],
stateParams["params"]["pH"],
stateParams["params"]["pC"],
containmentThresholdRatio0,
stateParams["icuCapacity"],
stateParams["hospitalCapacity"]
}&/@Range[numberOfSimulations]]

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
"R0"-> stateDistancing[state,"scenario1",1]*(r0natural0/100),
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


(* this is a modified version of CovidModel that does not take an r0 or importtime value, but isntead returns a parametric
ndsolve which is used later to fit those parameters against data *)
CovidModelFit[
daysUntilNotInfectiousOrHospitalized_,
daysFromInfectedToInfectious_,
daysUntilNotInfectiousOrHospitalized_,
daysToLeaveHosptialNonCritical_,
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
icuCapacity_,
percentPositiveCase_
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
	PCR'[t]   == (pPCRNH*percentPositiveCase[t]*Iq[t])/daysToGetTestedIfNotHospitalized0 + (pPCRH*percentPositiveCase[t]*HHq[t])/daysToGetTestedIfHospitalized0,

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
	{r0natural, importtime, pPCRNH,pPCRH}
];

endTime[ifun_]:=Part[ifun["Domain"],1,-1];



QP[symb_]:=Position[{Deaq,PCR,RepHq,Sq,Eq,ISq,RSq,IHq,HHq,RHq,Iq,ICq,EHq,HCq,CCq,RCq,est},symb][[1]][[1]];

(* Given a set fit parameters, simulated parameters and a definition of a scenario,
run all the simulations and produce the quantiles for the mean and confidence band estimates *)
evaluateScenario[state_, fitParams_, standardErrors_, stateParams_, scenario_, numberOfSimulations_:100]:=Module[{
    sol,
    evts,
    timeSeriesData,
    summary,
    simResults,
    endOfYear,
    events,
    endOfEval,herdTime,
    PCRQuantiles, DeathQuantiles, CurrentlyReportedHospitalizedQuantiles, CurrentlyInfectedQuantiles, CurrentlyInfectiousQuantiles, CumulativeInfectionQuantiles, CurrentlyHospitalizedQuantiles, CurrentlyCriticalQuantiles,
    deciles,
    containmentTime,
	hospitalOverloadTime,
	icuOverloadTime,
	sims,
	testSim,
	sim,
	setDistancing,
	rawSimResults,
	paramExpected,
	percentPositiveCase,
	distancing,
	pfunODE2,
	equationsDAE,
	initialConditions,
	output,
	dependentVariables,
	parameters,
	equationsODE,
	outputODE,
	eventsODE,
	lhs,
	rhs,
	dependentVariablesODE
    },
  
    distancing[t_] := stateDistancing[state, scenario["id"], t];
    percentPositiveCase[t_]:=posInterpMap[state][t];
    Clear[Sq,Eq,ISq,RSq,IHq,HHq,RHq,RepHq,Iq,ICq,EHq,HCq,CCq,RCq,Deaq,PCR,est];
Clear[r0natural,daysUntilNotInfectiousOrHospitalized,daysFromInfectedToInfectious,daysToLeaveHosptialNonCritical,pPCRNH,pPCRH,daysTogoToCriticalCare,daysFromCriticalToRecoveredOrDeceased,fractionOfCriticalDeceased,importtime,importlength,initialInfectionImpulse,tmax,pS,pH,pC,containmentThresholdCases,icuCapacity,hospitalCapacity];
equationsDAE = {
    Sq'[t]==(-distancing[t]*r0natural*Iq[t]*Sq[t])/daysUntilNotInfectiousOrHospitalized-est[t]*Sq[t],
    Eq'[t]==(distancing[t]*r0natural*Iq[t]*Sq[t])/daysUntilNotInfectiousOrHospitalized+est[t]*Sq[t]-Eq[t]/daysFromInfectedToInfectious,
    (*Infectious total, not yet PCR confirmed,age indep*)
    ISq'[t]==pS*Eq[t]/daysFromInfectedToInfectious-ISq[t]/daysUntilNotInfectiousOrHospitalized, 
    (*Recovered without needing care*)
    RSq'[t]==ISq[t]/daysUntilNotInfectiousOrHospitalized,
    (*Infected and will need hospital, won't need critical care*)
    IHq'[t]==pH*Eq[t]/daysFromInfectedToInfectious-IHq[t]/daysUntilNotInfectiousOrHospitalized,
    (*Going to hospital*)
    HHq'[t]==IHq[t]/daysUntilNotInfectiousOrHospitalized-HHq[t]/daysToLeaveHosptialNonCritical,
    (*Reported positive hospital cases*)
    RepHq'[t]==(pPCRH*HHq'[t])/daysForHospitalsToReportCases0,
    (*Cumulative hospitalized count*)
    EHq'[t]==IHq[t]/daysUntilNotInfectiousOrHospitalized,
    (*Recovered after hospitalization*)
    RHq'[t]==HHq[t]/daysToLeaveHosptialNonCritical,
    (*pcr confirmation*)
    PCR'[t]==(pPCRNH*percentPositiveCase[t]*Iq[t])/daysToGetTestedIfNotHospitalized0+(pPCRH*percentPositiveCase[t]*HHq[t])/daysToGetTestedIfHospitalized0,
    (*Infected, will need critical care*)
    ICq'[t]==pC*Eq[t]/daysFromInfectedToInfectious-ICq[t]/daysUntilNotInfectiousOrHospitalized,
    (*Hospitalized,
    need critical care*)
    HCq'[t]==ICq[t]/daysUntilNotInfectiousOrHospitalized-HCq[t]/daysTogoToCriticalCare,
    (*Entering critical care*)
    CCq'[t]==HCq[t]/daysTogoToCriticalCare-CCq[t]/daysFromCriticalToRecoveredOrDeceased,
    (*Dying*)
    Deaq'[t]==CCq[t]*If[CCq[t]>=icuCapacity,2*fractionOfCriticalDeceased,fractionOfCriticalDeceased]/daysFromCriticalToRecoveredOrDeceased,
    (*Leaving critical care*)
    RCq'[t]==CCq[t]*(1-fractionOfCriticalDeceased)/daysFromCriticalToRecoveredOrDeceased,
    
    est'[t]==0,
    Iq[t]==ISq[t]+IHq[t]+ICq[t] (*Infected without needing care*)
};
events = {
    WhenEvent[Iq[t]<=containmentThresholdCases&&PCR[t]<=0.1,Sow[{t,Iq[t]},"containment"]],(*when the virus is contained without herd immunity extract the time*)
    WhenEvent[RSq[t]+RSq[t]+RCq[t]>=0.7,Sow[{t,RSq[t]+RSq[t]+RCq[t]},"herd"]],
    WhenEvent[CCq[t]>=icuCapacity,Sow[{t,CCq[t]},"icu"]],(*ICU Capacity overshot*)
    WhenEvent[Iq[t]<=1,Sow[{t,Iq[t]},"cutoff"]] (*dont bother running when active infections less than 100 it can lead to evaluation issues in long tail simulations*),
    WhenEvent[HHq[t]>=hospitalCapacity,Sow[{t,HHq[t]},"hospital"]],(*Hospitals Capacity overshot*)
    WhenEvent[t>=importtime,est[t]->Exp[-initialInfectionImpulse]],
    WhenEvent[t>importtime+importlength,est[t]->0]
};
initialConditions = {Sq[0]==1,Eq[0]==0,ISq[0]==0,RSq[0]==0,IHq[0]==0,HHq[0]==0,RepHq[0]==0,RHq[0]==0,ICq[0]==0,HCq[0]==0,CCq[0]==0,RCq[0]==0,Deaq[0]==0,est[0]==0,PCR[0]==0,EHq[0]==0};
output = {Deaq, PCR, RepHq, Sq, Eq, ISq, RSq, IHq, HHq, RHq, Iq,ICq, EHq, HCq, CCq, RCq, est};
dependentVariables = {Deaq, PCR, RepHq, Sq, Eq, ISq, RSq, IHq, HHq, RHq,ICq, EHq, HCq, CCq, RCq, est,Iq};
parameters = {
    r0natural,
    daysUntilNotInfectiousOrHospitalized,
    daysFromInfectedToInfectious,
    daysToLeaveHosptialNonCritical,
    pPCRNH,
    pPCRH,
    daysTogoToCriticalCare,
    daysFromCriticalToRecoveredOrDeceased,
    fractionOfCriticalDeceased,
    importtime,
    importlength,
    initialInfectionImpulse,
    tmax,
    pS,
    pH,
    pC,
    containmentThresholdCases,
    icuCapacity,
    hospitalCapacity
};
equationsODE = Drop[equationsDAE /. Iq[t]->ISq[t]+IHq[t]+ICq[t], -1];
outputODE = output /. Iq[t]->ISq[t]+IHq[t]+ICq[t];
eventsODE = events /. Iq[t]->ISq[t]+IHq[t]+ICq[t];
lhs = equationsODE[[All,1]];
rhs = equationsODE[[All,2]];
rhs = rhs /. Thread[lhs->rhs];
equationsODE = Thread[lhs==rhs];
dependentVariablesODE = Drop[dependentVariables, -1];

    pfunODE2 = ParametricNDSolveValue[{
  equationsODE, 
  eventsODE, 
  initialConditions
}, outputODE, {t,0,tmax}, parameters,DependentVariables->dependentVariablesODE,Method->{"DiscontinuityProcessing"->False}];
	
	paramExpected = {
    fitParams["r0natural"],
	daysUntilNotInfectiousOrHospitalized0,
	daysFromInfectedToInfectious0,
	daysToLeaveHosptialNonCritical0,
	fitParams["pPCRNH"],
	fitParams["pPCRH"],
	daysTogoToCriticalCare0,
	daysFromCriticalToRecoveredOrDeceased0,
	fractionOfCriticalDeceased0,
	fitParams["importtime"],
	importlength0,
	initialInfectionImpulse0,
	tmax0,
	stateParams["params"]["pS"],
	stateParams["params"]["pH"],
	stateParams["params"]["pC"],
	containmentThresholdRatio0,
	stateParams["icuCapacity"],
	stateParams["hospitalCapacity"]
	};
	
	(* do one solution with the mean param values for the estimate *)
	{sol,evts} = Reap[Apply[pfunODE2,paramExpected],{"containment","herd","icu","hospital","cutoff"},Rule];
	
	events=Association[Flatten[evts]];
	endOfYear = 365;
	(* we  chop off the data here with one of either a containment or herd immunity events *)
	endOfEval = If[KeyExistsQ[events, "containment"], events["containment"][[1]][[1]], 
		If[KeyExistsQ[events, "cutoff"], events["cutoff"][[1]][[1]],
	    endOfYear]];
	
	sims=generateSimulations[numberOfSimulations,fitParams,standardErrors,endOfEval,stateParams];

	(* generate a solution for each simulation so we can get bands *)
	(* Quiet because we handle bad interpolating functions in the next line *)
	rawSimResults=Apply[pfunODE2, #]&/@sims//Quiet;
	simResults=Select[rawSimResults, endTime[First[#]]>=endOfEval&];
   
    deciles = Range[10]/10;
	(* define functions to get the lci, mean, uci quantiles for each of the functions we want
	to produce time-series for *)
	PCRQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*#[[QP[PCR]]][t])&/@simResults,deciles];
	DeathQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*#[[QP[Deaq]]][t])&/@simResults,deciles];
	CurrentlyReportedHospitalizedQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*#[[QP[RepHq]]][t])&/@simResults,deciles];
	CurrentlyInfectedQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*#[[QP[Eq]]][t])&/@simResults,deciles];
	CurrentlyInfectiousQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*(#[[QP[ISq]]][t] + #[[QP[IHq]]][t] + #[[QP[ICq]]][t]))&/@simResults,deciles];
	CumulativeInfectionQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*(#[[QP[RSq]]][t] + #[[QP[RHq]]][t] + #[[QP[RCq]]][t] ))&/@simResults,deciles];
	CurrentlyHospitalizedQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*#[[QP[HHq]]][t])&/@simResults,deciles];
	CurrentlyCriticalQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*#[[QP[CCq]]][t])&/@simResults,deciles];	

	timeSeriesData = Module[{},
	Table[Association[{
	"day"->t,
	"distancing"->distancing[t],
	"cumulativePcr" -> Merge[{
	   <|"confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, Null, Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["positive"]]|>,
	   <|"expected"-> stateParams["params"]["population"]*sol[[QP[PCR]]][t]|>,
	   Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,PCRQuantiles[t]]]
	},First],
	"cumulativeDeaths" -> Merge[{
	   <|"confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, Null,Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["death"]]|>,
	   <|"expected"-> stateParams["params"]["population"]*sol[[QP[Deaq]]][t]|>,
	   Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,DeathQuantiles[t]]]
	},First],
	"currentlyInfected" -> Merge[{
	    Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyInfectedQuantiles[t]]],
	    <|"expected"-> stateParams["params"]["population"]*sol[[QP[Eq]]][t]|>
	}, First],
	"currentlyInfectious" -> Merge[{
	    Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyInfectiousQuantiles[t]]],
	    <|"expected"-> stateParams["params"]["population"]*(sol[[QP[ISq]]][t] + sol[[QP[IHq]]][t] + sol[[QP[ICq]]][t])|>
	}, First],
	"cumulativeInfections" -> Merge[{
	    Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CumulativeInfectionQuantiles[t]]],
	    <|"expected"-> stateParams["params"]["population"]*(sol[[QP[RSq]]][t] + sol[[QP[RHq]]][t] + sol[[QP[RCq]]][t])|>
	}, First],
	"currentlyReportedHospitalized" -> Merge[{
	   <|"confirmed"->If[Length[Select[stateParams["hospitalizationData"],(#["day"]==t)&]]!=1, Null,Select[stateParams["hospitalizationData"],(#["day"]==t)&][[1]]["hospitalizations"]]|>,
	   Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyReportedHospitalizedQuantiles[t]]],
	   <|"expected"-> stateParams["params"]["population"]*sol[[QP[RepHq]]][t]|>
	},First],
	"currentlyHospitalized" -> Merge[{
	   Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyHospitalizedQuantiles[t]]],
	   <|"expected"-> stateParams["params"]["population"]*sol[[QP[HHq]]][t]|>
	}, First],
	"currentlyCritical" -> Merge[{
	    Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyCriticalQuantiles[t]]],
	    <|"expected"-> stateParams["params"]["population"]*sol[[QP[CCq]]][t]|>
	   },First]
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
	(* 30 % asymptomatic haircut *) 
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
      }]}, First]
];

(* evaluate state for all scenarios *)
(* we first fit the data on PCR and fatalities to find the R0 and importtime for that state
then we generate a set of all the simulated parameters. Finally we call evaluateScenario to run and aggregate the
simulation results for each scenario *)
evaluateState[state_, numberOfSimulations_:100]:= Module[{sol,distancing,params,percentPositiveCase,weekOverWeekWeight,longData,thisStateData,model,fit,fitParams,lciuci,icuCapacity,t,dataWeights,standardErrors,hospitalizationData,hospitalCapacity,sims,gofMetrics},
    (* fit R0 / import time per state, then forecast each scenario *)
    params=stateParams[state,pC0,pH0,medianHospitalizationAge0,ageCriticalDependence0,ageHospitalizedDependence0];
	icuCapacity=params["icuBeds"]/params["population"];
	thisStateData=Select[parsedData,(#["state"]==state&&#["positive"]>0)&];
	hospitalCapacity=(1-params["bedUtilization"])*params["staffedBeds"]/params["population"];
	hospitalizationData = stateHospitalizationData[state];
	
    (* just do the fit to scenario1, the fit happens on points that are in the past, sot he future scenario doesn't impact *)
	distancing[t_] := stateDistancing[state, "scenario1", t];
	percentPositiveCase[t_]:=posInterpMap[state][t];
	
	sol=CovidModelFit[
	daysUntilNotInfectiousOrHospitalized0,
	daysFromInfectedToInfectious0,
	daysUntilNotInfectiousOrHospitalized0,
	daysToLeaveHosptialNonCritical0,
	daysTogoToCriticalCare0,
	daysFromCriticalToRecoveredOrDeceased0,
	fractionOfCriticalDeceased0,
	importlength0,
	initialInfectionImpulse0,
	tmax0,
	params["pS"],
	params["pH"],
	params["pC"],
	distancing,
	icuCapacity,
	percentPositiveCase
	];

    model[r0natural_,importtime_,pPCRNH_,pPCRH_][i_,t_]:=Through[sol[r0natural,importtime,pPCRNH,pPCRH][t],List][[i]]/;And@@NumericQ/@{r0natural,importtime,pPCRNH,pPCRH,i,t};
	
	(* we make the data shape (metric#, day, value) so that we can simultaneously fit PCR and deaths *)
	longData=Select[Join[
	  {1,#["day"],If[TrueQ[#["deathIncrease"]==Null],0,(#["deathIncrease"]/params["population"])//N]}&/@thisStateData,
	  {2,#["day"],(#["positiveIncrease"]/params["population"])//N}&/@thisStateData
	],#[[3]]>0&];
	
	(* set weights for each datapoint in longData *)
	(* apply a week over week weight reduction, i.e. 0.75 indicates that a data point at day 0 is weighted 75% as strongly as a data point at day 7. *)
	(* assume each datapoint otherwise has a constant relative variance (Poissan) for both death and PCR rates. *)
	(* the constant factor of the population shouldn't matter, but the fit chokes if the weights are too small *)
	weekOverWeekWeight=.75;
	dataWeights=(weekOverWeekWeight^(#[[1]]/7)(params["population"]#[[3]])^-1)&/@longData;
	
	(* Switch to nminimize, if we run into issues with the multi-fit not respecting weights *)
	(* confidence interval we get from doing the log needs to be back-transformed *)
	(* unclear how easy it is to get parameter confidence intervals from nminmize *)
	fit=NonlinearModelFit[
		longData,
		(* fit to daily increases *) 
		(* TODO log the model and log the data *)
		model[r0natural,importtime,pPCRNH,pPCRH][i,t] - model[r0natural,importtime,pPCRNH,pPCRH][i,t-1], 
		{{r0natural, Log[r0natural0]}, {importtime, Log[params["importtime0"]]}, {pPCRNH, pPCRNH0}, {pPCRH, pPCRH0}},
		{i,t},
		Weights->dataWeights,
		AccuracyGoal->5,
		PrecisionGoal->10
	];
	(* if we cannot get smooth enough then use Nelder-Mead Post-processing \[Rule] false *)
	
	fitParams=Exp[#]&/@KeyMap[ToString[#]&, Association[fit["BestFitParameters"]]];
	(* TODO: try using VarianceEstimatorFunction\[Rule](1)& *)
	standardErrors=Exp[#]&/@KeyMap[ToString[#]&, AssociationThread[{r0natural,importtime,pPCRNH,pPCRH},
	     fit["ParameterErrors",
	     ConfidenceLevel->0.97]]];
	gofMetrics=goodnessOfFitMetrics[fit["FitResiduals"],longData];
	
	(* do a monte carlo for each scenario *)
   Merge[{
      <|"scenarios"->
         Association[{#["id"]->evaluateScenario[state,fitParams,standardErrors,
         <|"params"->params,
           "thisStateData"->thisStateData,
           "icuCapacity"->icuCapacity,
           "hospitalCapacity"->hospitalCapacity, 
           "hospitalizationData"-> hospitalizationData
         |>, #, numberOfSimulations]}&/@scenarios]|>,
      <|"parameterBest"->fitParams|>,
      KeyDrop[stateParams[state, pC0,pH0,medianHospitalizationAge0,ageCriticalDependence0,ageHospitalizedDependence0],{"R0","importtime0"}],
      "r0"->fitParams["r0natural"],
      "importtime"->fitParams["importtime"],
      "longData"->longData,
      "goodnessOfFitMetrics"->gofMetrics
    }, First] 
];

(* export the full model data, Warning: paralllize will eat a lot of laptop resources while it evaluates *)
evaluateStateAndPrint[state_, simulationsPerCombo_:1000]:=Module[{},
  Print["generating data for " <> state];
  evaluateState[state, simulationsPerCombo]
];
GenerateModelExport[simulationsPerCombo_:1000, states_:distancingStates] := Module[{},
	loopBody[state_]:=Module[{stateData},
		stateData=evaluateStateAndPrint[state, simulationsPerCombo];
		Export["public/json/"<>state<>".json",stateData];
		stateData
	];
	
	allStatesData=Association[Parallelize[Map[(#->loopBody[#])&,states]]];
	exportAllStatesGoodnessOfFitMetricsCsv["tests/gof-metrics.csv",allStatesData];
	exportAllStatesGoodnessOfFitMetricsSvg["tests/relative-fit-errors.svg",allStatesData];
	allStatesData
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

(* helper to check that the parameter dists are centered *)
(*Echo[(Mean[#]&/@Transpose[sims] - paramExpected)//N];*)
