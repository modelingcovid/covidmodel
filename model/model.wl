(* ::Package:: *)

(** Model parameters. See https://docs.google.com/spreadsheets/d/1DH58EFf_YkWHa_zn8-onBGzsYFMamjSjOItr137vu9g/edit#gid=0 **)
SetDirectory[$UserDocumentsDirectory<>"/Github/covidmodel"];

Import["model/data.wl"];
Import["model/gof-metrics.wl"];
Import["model/plot-utils.wl"];

(* to do a quick run GenerateModelExport[100,testCaseStates] *)
testCaseStates={"CA","VA","FL","CO", "MD","TX","WA","OR", "PA", "CT", "OH", "VT"};

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
(* days to get tested after infectious *)
daysToGetTested0 = 6.5;

(* the penalty to fatailty rate in the case patients cannot get ICU care *)
icuOverloadDeathPenalty0 = 1;

(* virus start parameters *)
initialInfectionImpulse0 = 12.5;

(*Duration of pulse in force of infection for establishment, days*)
importlength0 = 3;

(*Establishment time, N days before X Cases*)
importtime0 = (31+20);

(* baseline r value -- this is now fit on a state by state basis since it varies widely on demographic factors like population density *)
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

(* percent positive test delay *)
percentPositiveTestDelay0 = 11;

(* probability that an infected 80 year old will require critical care *)
pCritical80YearOld0=0.15;

(* probability that an infecteed 80 year old will need hospitalization but not critical care *)
pHospitalized80YearOld0=0.20;

midpointConvergeStateDifferences0=today+130;
startConvergeStateDifferences0=today+102;
statesConvergeToValue0=4;



(* Heterogeneity level, determines percent of population infected at equilibrium *)
(* we set this to target 60% infected at the end of 2021 were no intervention to happen *)
k0 = 1*10^-2;

(* Fraction of symptomatic cases *)
fractionSymptomatic0 = 0.7;

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

(* to help the numerical optimizer we give slightly different problem bounds depening on state
based on eg their epidemics starting earlier or having different hospital systems and thus a different
gap between PCR and death *)
(* In the future a proposal for how to fix this is to run a meta fit varying the bounds around reasonable ranges
and starting with a different random seed, then pick the best one (the real one that didnt get stuck hopefully) *)
fitStartingOverrides=<|
  "AZ"-><|"rlower"->3,"rupper"->4,"tlower"->50,"tupper"->54,"replower"->1.5,"repupper"->2|>,
  "CA"-><|"rlower"->3.1,"rupper"->4,"tlower"->46,"tupper"->54,"replower"->1.4,"repupper"->2|>,
  "FL"-><|"rlower"->2.9,"rupper"->4.2,"tlower"->56,"tupper"->60,"replower"->1.4,"repupper"->1.7|>,
  "PA"-><|"rlower"->4.2,"rupper"->5,"tlower"->57,"tupper"->60,"replower"->1.65,"repupper"->2|>,
  "CO"-><|"rlower"->3.3,"rupper"->4.4,"tlower"->45,"tupper"->60,"replower"->1.1,"repupper"->1.4|>,
  "TX"-><|"rlower"->3.5,"rupper"->4.8,"tlower"->40,"tupper"->61,"replower"->1.4,"repupper"->1.7|>,
  "WA"-><|"rlower"->2.3,"rupper"->2.6,"tlower"->27,"tupper"->37,"replower"->0.8,"repupper"->1.4|>,
  "CT"-><|"rlower"->4,"rupper"->5,"tlower"->52,"tupper"->57,"replower"->0.8,"repupper"->1.3|>,
  "OH"-><|"rlower"->3.8,"rupper"->4.6,"tlower"->53,"tupper"->62,"replower"->0.5,"repupper"->1.4|>,
  "NY"-><|"rlower"->5,"rupper"->6,"tlower"->48,"tupper"->60,"replower"->1,"repupper"->1.3|>,
  "VA"-><|"rlower"->3.4,"rupper"->4.2,"tlower"->55,"tupper"->60,"replower"->0.5,"repupper"->1.5|>,
  "VT"-><|"rlower"->2.5,"rupper"->2.9,"tlower"->38,"tupper"->41,"replower"->0.8,"repupper"->1|>,
  "LA"-><|"rlower"->4.1,"rupper"->4.5,"tlower"->45,"tupper"->50,"replower"->0.5,"repupper"->1.4|>,
  "MI"-><|"rlower"->4.7,"rupper"->5.4,"tlower"->52,"tupper"->56,"replower"->0.5,"repupper"->1.4|>,
  "MS"-><|"rlower"->2.5,"rupper"->5,"tlower"->46,"tupper"->56,"replower"->1.4,"repupper"->1.6|>,
  "MA"-><|"rlower"->4.6,"rupper"->5.7,"tlower"->45,"tupper"->57,"replower"->1.5,"repupper"->1.7|>,
  "MD"-><|"rlower"->3.7,"rupper"->4.8,"tlower"->40,"tupper"->60,"replower"->1.4,"repupper"->1.6|>,
  "GA"-><|"rlower"->3.3,"rupper"->4,"tlower"->45,"tupper"->55,"replower"->1,"repupper"->1.4|>,
  "NJ"-><|"rlower"->5.2,"rupper"->6,"tlower"->50,"tupper"->54,"replower"->0.5,"repupper"->1.6|>,
  "IL"-><|"rlower"->4,"rupper"->5,"tlower"->56,"tupper"->60,"replower"->0.5,"repupper"->1.4|>,
  "IN"-><|"rlower"->3.5,"rupper"->5,"tlower"->45,"tupper"->58,"replower"->0.5,"repupper"->1.4|>,
  "OK"-><|"rlower"->3.5,"rupper"->4,"tlower"->45,"tupper"->55,"replower"->0.7,"repupper"->1.4|>,
  "WI"-><|"rlower"->3.4,"rupper"->4.3,"tlower"->50,"tupper"->60,"replower"->0.5,"repupper"->1.7|>,
  "NV"-><|"rlower"->3.6,"rupper"->4.3,"tlower"->48,"tupper"->54,"replower"->0.5,"repupper"->1.4|>,
  "OR"-><|"rlower"->2.8,"rupper"->4,"tlower"->48,"tupper"->54,"replower"->0.5,"repupper"->1.4|>,
  "SC"-><|"rlower"->2.8,"rupper"->4.6,"tlower"->48,"tupper"->60,"replower"->1.3,"repupper"->2|>
|>;

getBounds[state_]:=Module[{},
  If[MemberQ[Keys[fitStartingOverrides],state],
    {fitStartingOverrides[state]["rlower"],fitStartingOverrides[state]["rupper"],fitStartingOverrides[state]["tlower"],fitStartingOverrides[state]["tupper"],fitStartingOverrides[state]["replower"],fitStartingOverrides[state]["repupper"]},
    {2.5,3.8,40,60,4,6}]
];

(* define some helper distributions and set up all the parameters that need to be simulated *)
BetaMeanSig[mu_,sig_]:=BetaDistribution[(mu^2-mu^3-mu sig)/sig,((-1+mu) (-mu+mu^2+sig))/sig];
PosNormal[mu_,sig_]:=TruncatedDistribution[{0,\[Infinity]},NormalDistribution[mu,sig]]

(* a function to generate the monte carlo simulations from combo of fit / assumed parameters *)
(* for the assumed parameters we temporarily have a 5% stdev, but we will replace this with a calculated
one when we have multiple literature sources shortly *)
generateSimulations[numberOfSimulations_, fitParams_, standardErrors_, cutoff_, stateParams_]:=Module[{}, {
    RandomVariate[PosNormal[fitParams["r0natural"],0.05*fitParams["r0natural"]]],
    RandomVariate[PosNormal[daysUntilNotInfectiousOrHospitalized0,daysUntilNotInfectiousOrHospitalized0*0.05]],
    RandomVariate[PosNormal[daysFromInfectedToInfectious0,daysFromInfectedToInfectious0*0.05]],
    RandomVariate[PosNormal[daysToLeaveHosptialNonCritical0,daysToLeaveHosptialNonCritical0*0.05]],
    RandomVariate[PosNormal[pPCRNH0,pPCRNH0*0.05]],
    RandomVariate[PosNormal[pPCRH0,pPCRH0*0.05]],
    RandomVariate[PosNormal[daysTogoToCriticalCare0,daysTogoToCriticalCare0*0.05]],
    RandomVariate[PosNormal[daysFromCriticalToRecoveredOrDeceased0,daysFromCriticalToRecoveredOrDeceased0*0.05]],
    RandomVariate[BetaMeanSig[fractionOfCriticalDeceased0,fractionOfCriticalDeceased0*0.02]],
    RandomVariate[PosNormal[fitParams["importtime"],0.05*fitParams["importtime"]]],
    RandomVariate[PosNormal[importlength0,importlength0*0.05]],
    RandomVariate[PosNormal[initialInfectionImpulse0,initialInfectionImpulse0*0.05]],
    cutoff,
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    containmentThresholdRatio0,
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"],
    RandomVariate[PosNormal[fitParams["stateAdjustmentForTestingDifferences"], 0.05*fitParams["stateAdjustmentForTestingDifferences"]]],
    RandomVariate[PosNormal[k0,k0*0.05]],
    RandomVariate[PosNormal[fitParams["distpow"], 0.05*fitParams["distpow"]]]
  }&/@Range[numberOfSimulations]]

(* Assumption here is that age dependence follows a logistic curve -- zero year olds dont require any care, 
100 year olds require significant case, midpoint is the medianHospitalization age *)
infectedCritical[a_,medianHospitalizationAge_,pC80_,ageCriticalDependence_] :=
pC80(1+E^((-80+medianHospitalizationAge)/ageCriticalDependence)) 1/(1+Exp[-((a-medianHospitalizationAge)/ageCriticalDependence)]);

infectedHospitalized[a_,medianHospitalizationAge_,pH80_,ageHospitalizedDependence_] :=
pH80(1+E^((-80+medianHospitalizationAge)/ageHospitalizedDependence)) 1/(1+Exp[-((a-medianHospitalizationAge)/ageHospitalizedDependence)]);

noCare[a_,medianHospitalizationAge_,pC80_, pH80_,ageCriticalDependence_,ageHospitalizedDependence_] :=
1-infectedCritical[a, medianHospitalizationAge, pC80,ageCriticalDependence]-
infectedHospitalized[a, medianHospitalizationAge,pH80, ageHospitalizedDependence];

(* test for the overall fraction that end up in the ICU out of all hospitalized *)
(*1/Sum[stateParams[state]["population"],{state,statesWithRates}]Sum[stateParams[state]["pC"]/(stateParams[state]["pH"]+stateParams[state]["pC"])*stateParams[state]["population"],{state,statesWithRates}]*)

(* fit the PCR age distribution to lousiana data *)
(* distribution from https://docs.google.com/spreadsheets/d/1N4cMGvi1y7nRJP_dvov2iaAnJlXcr2shWhHZhhI4_qA/edit#gid=1050365393 *)
(* age distribution from wolfram *)
{wid,posmid,tot,pop}={{18,12,10,10,10,10}, {9,23.5,35,45,55,65},{123,1247,2048,2395,2737,2306}, {1112733,801901,623237,563402,625430,506630}};
proppcrage=Transpose@{posmid,tot/(wid*pop)}//N;
pcrModel=NonlinearModelFit[proppcrage,0.00048/(1+Exp[-k(x-x0)]),{k,x0},x];
pPCRNH0adj=(x/.Solve[Total[Sum[pcrModel[a]*x*100/NIntegrate[pcrModel[b],{b,0,100}]*stateRawDemographicData[#]["Distribution"][[Position[stateRawDemographicData[#]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[#]["Buckets"]}]&/@statesWithRates]/Length[statesWithRates]==pPCRNH0,x])[[1]];
pPCRH0adj=(x/.Solve[Total[Sum[pcrModel[a]*x*100/NIntegrate[pcrModel[b],{b,0,100}]*stateRawDemographicData[#]["Distribution"][[Position[stateRawDemographicData[#]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[#]["Buckets"]}]&/@statesWithRates]/Length[statesWithRates]==pPCRH0,x])[[1]];
pPCRage[a_,adj_]:=pcrModel[a]*adj*100/NIntegrate[pcrModel[b],{b,0,100}];
pPCRNH0State[state_]:=Sum[pPCRage[a,pPCRNH0adj ]*stateRawDemographicData[state]["Distribution"][[Position[stateRawDemographicData[state]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[state]["Buckets"]}]
pPCRH0State[state_]:=Sum[pPCRage[a,pPCRH0adj ]*stateRawDemographicData[state]["Distribution"][[Position[stateRawDemographicData[state]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[state]["Buckets"]}]

(* fit the spread of the fraction of critical deceased to the death age distribution *)
deathAgeModel=NonlinearModelFit[Transpose@{deathdist[[2]],deathdist[[3]]},0.11/(1+Exp[-k(x-x0)]),{k,x0},x];
criticalDeceasedAge[a_,adj_]:=deathAgeModel[a]*adj*100/NIntegrate[deathAgeModel[b],{b,0,100}];
deceasedAdjustWeight=(x/.Solve[Total[Sum[deathAgeModel[a]*x*100/NIntegrate[deathAgeModel[b],{b,0,100}]*stateRawDemographicData[#]["Distribution"][[Position[stateRawDemographicData[#]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[#]["Buckets"]}]&/@statesWithRates]/Length[statesWithRates]==fractionOfCriticalDeceased0,x])[[1]];
criticalDeceasedState[state_]:=Sum[criticalDeceasedAge[a,deceasedAdjustWeight ]*stateRawDemographicData[state]["Distribution"][[Position[stateRawDemographicData[state]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[state]["Buckets"]}]

stateParams[state_]:=Module[{raw,pop,dist,buckets},
  raw = stateRawDemographicData[state];
  pop = raw["Population"];
  dist = raw["Distribution"];
  buckets = raw["Buckets"];

  (*return a map of per state params to values *)
  <|
    "population"->pop,
    "importtime0"->If[!KeyExistsQ[stateImportTime, state],Min[#["day"]&/@Select[parsedData,(#["state"]==state&&#["positive"]>=50)&]] - 20,stateImportTime[state]], (* importtime 20 days before 50 PCR confirmed reached *)
    "ventilators"->ventilators[state],
    "icuBeds"->stateICUData[state]["icuBeds"],
    "staffedBeds"->stateICUData[state]["staffedBeds"],
    "bedUtilization"->stateICUData[state]["bedUtilization"],
    "hospitalCapacity"->(1-stateICUData[state]["bedUtilization"])*stateICUData[state]["staffedBeds"],
    "pS"->Sum[noCare[a, medianHospitalizationAge0, pCritical80YearOld0 ,pHospitalized80YearOld0,ageCriticalDependence0,ageHospitalizedDependence0 ]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
    "pH"->Sum[infectedHospitalized[a, medianHospitalizationAge0, pHospitalized80YearOld0,ageHospitalizedDependence0]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
    "pC"->Sum[infectedCritical[a, medianHospitalizationAge0, pCritical80YearOld0,ageCriticalDependence0]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
    "pPCRNH"->pPCRNH0State[state],
    "pPCRH"->pPCRH0State[state],
    "fractionOfCriticalDeceased"->criticalDeceasedState[state]
  |>
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


QP[symb_]:=Position[{Deaq,PCR,CRepHq,RepHq,Sq,Eq,ISq,RSq,IHq,HHq,RHq,Iq,ICq,EHq,HCq,CCq,RCq,est},symb][[1]][[1]];

endTime[ifun_]:=Part[ifun["Domain"],1,-1];

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
    deciles,
    containmentTime,
    hospitalOverloadTime,
    PCRQuantiles,
    DeathQuantiles,
    CurrentlyReportedHospitalizedQuantiles,
    CurrentlyInfectedQuantiles,
    CurrentlyInfectiousQuantiles,
    CumulativeInfectionQuantiles,
    CumulativeRecoveredQuantiles,
    RecoveredHospitalizedQuantiles,
    RecoveredCriticalQuantiles,
    CurrentlyHospitalizedQuantiles,
    CurrentlyCriticalQuantiles,
    CumulativeEverHospitalizedQuantiles,
    CumulativeEverCriticalQuantiles,
    CumulativeReportedHospitalizedQuantiles,
    SuseptibleQuantiles,
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
    prettyEvents,
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

  distancing = stateDistancingPrecompute[state][scenario["id"]]["distancingFunction"];
  percentPositiveCase[t_]:=posInterpMap[state][t];
  Clear[Sq,Eq,ISq,RSq,IHq,HHq,RHq,RepHq,Iq,ICq,EHq,HCq,CCq,RCq,Deaq,PCR,est];
  Clear[r0natural,daysUntilNotInfectiousOrHospitalized,daysFromInfectedToInfectious,daysToLeaveHosptialNonCritical,pPCRNH,pPCRH,daysTogoToCriticalCare,daysFromCriticalToRecoveredOrDeceased,fractionOfCriticalDeceased,importtime,importlength,initialInfectionImpulse,tmax,pS,pH,pC,containmentThresholdCases,icuCapacity,hospitalCapacity,distpow];
  equationsDAE = {
    Sq'[t]==(- k * Log[1 + (distancing[t]^distpow*Iq[t]*r0natural)/(k*daysUntilNotInfectiousOrHospitalized )]*Sq[t])-est[t]*Sq[t],
    Eq'[t]==( k * Log[1 + (distancing[t]^distpow*Iq[t]*r0natural)/(k*daysUntilNotInfectiousOrHospitalized )]*Sq[t])+est[t]*Sq[t]-Eq[t]/daysFromInfectedToInfectious,
    (*    Sq'[t]==(-distancing[t]^distpow*r0natural*(ISq[t]+IHq[t]+ICq[t] )*Sq[t])/daysUntilNotInfectiousOrHospitalized0-est[t]*Sq[t],
    Eq'[t]==(distancing[t]^distpow*r0natural*(ISq[t]+IHq[t]+ICq[t] )*Sq[t])/daysUntilNotInfectiousOrHospitalized0+est[t]*Sq[t]-Eq[t]/daysFromInfectedToInfectious0,*)
    (*Infectious total, not yet PCR confirmed,age indep*)
    ISq'[t]==pS*Eq[t]/daysFromInfectedToInfectious-ISq[t]/daysUntilNotInfectiousOrHospitalized,
    (*Recovered without needing care*)
    RSq'[t]==ISq[t]/daysUntilNotInfectiousOrHospitalized,
    (*Infected and will need hospital, won't need critical care*)
    IHq'[t]==pH*Eq[t]/daysFromInfectedToInfectious-IHq[t]/daysUntilNotInfectiousOrHospitalized,
    (*Going to hospital*)
    HHq'[t]==IHq[t]/daysUntilNotInfectiousOrHospitalized-HHq[t]/daysToLeaveHosptialNonCritical,
    (*Reported positive hospital cases*)
    RepHq'[t]==testingProbability[t] * HHq'[t]/daysForHospitalsToReportCases0,
    (* cumulative reported hospital cases *)
    CRepHq'[t]==testingProbability[t] * HHq[t]/daysForHospitalsToReportCases0,
    (*Cumulative hospitalized count*)
    EHq'[t]==IHq[t]/daysUntilNotInfectiousOrHospitalized,
    (*Recovered after hospitalization*)
    RHq'[t]==HHq[t]/daysToLeaveHosptialNonCritical,
    (*pcr confirmation*)
    PCR'[t] ==testingProbability[t] * (statesConvergeToValue0/(1+Exp[-(1/(midpointConvergeStateDifferences0-startConvergeStateDifferences0))Log[statesConvergeToValue0/stateAdjustmentForTestingDifferences-1]*(t-midpointConvergeStateDifferences0)])+  stateAdjustmentForTestingDifferences) * (pPCRNH*ISq[t] + pPCRH*(IHq[t]+ICq[t])) / (daysToGetTested0),
    (*Infected, will need critical care*)
    ICq'[t]==pC*Eq[t]/daysFromInfectedToInfectious-ICq[t]/daysUntilNotInfectiousOrHospitalized,
    (*Hospitalized,
    need critical care*)
    HCq'[t]==ICq[t]/daysUntilNotInfectiousOrHospitalized-HCq[t]/daysTogoToCriticalCare,
    (*Entering critical care*)
    CCq'[t]==HCq[t]/daysTogoToCriticalCare-CCq[t]/daysFromCriticalToRecoveredOrDeceased,
    (*Dying*)
    Deaq'[t]==CCq[t]*If[CCq[t]>=icuCapacity,fractionOfCriticalDeceased,fractionOfCriticalDeceased]/daysFromCriticalToRecoveredOrDeceased,
    (*Leaving critical care*)
    RCq'[t]==CCq[t]*(1-fractionOfCriticalDeceased)/daysFromCriticalToRecoveredOrDeceased,
    (* establishment *)
    est'[t]==0,
    (* we should just drop this equation so we dont need the ODE conversion below *)
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
  initialConditions = {Sq[0]==1,Eq[0]==0,ISq[0]==0,RSq[0]==0,IHq[0]==0,HHq[0]==0,RepHq[0]==0,CRepHq[0]==0,RHq[0]==0,ICq[0]==0,HCq[0]==0,CCq[0]==0,RCq[0]==0,Deaq[0]==0,est[0]==0,PCR[0]==0,EHq[0]==0};
  output = {Deaq, PCR, CRepHq, RepHq, Sq, Eq, ISq, RSq, IHq, HHq, RHq, Iq,ICq, EHq, HCq, CCq, RCq, est};
  dependentVariables = {Deaq, PCR, CRepHq, RepHq, Sq, Eq, ISq, RSq, IHq, HHq, RHq,ICq, EHq, HCq, CCq, RCq, est,Iq};
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
    hospitalCapacity,
    stateAdjustmentForTestingDifferences,
    k,
    distpow
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
    },
    outputODE,
    {t,tmin0,tmax},
    parameters,
    DependentVariables->dependentVariablesODE,
    Method->{"DiscontinuityProcessing"->False}
  ];

  Clear[paramExpected];
  paramExpected = {
    fitParams["r0natural"],
    daysUntilNotInfectiousOrHospitalized0,
    daysFromInfectedToInfectious0,
    daysToLeaveHosptialNonCritical0,
    stateParams["params"]["pPCRNH"],
    stateParams["params"]["pPCRH"],
    daysTogoToCriticalCare0,
    daysFromCriticalToRecoveredOrDeceased0,
    stateParams["params"]["fractionOfCriticalDeceased"],
    fitParams["importtime"],
    importlength0,
    initialInfectionImpulse0,
    tmax0,
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    containmentThresholdRatio0,
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"],
    fitParams["stateAdjustmentForTestingDifferences"],
    k0,
    fitParams["distpow"]
  };

  (* do one solution with the mean param values for the estimate *)
  (* Quiet because the it tries to evaluate the interpolating function at zero when it should hold the evaluation (and not evaluate there) *)
  {sol,evts} = Quiet[Reap[Apply[pfunODE2,paramExpected],{"containment","herd","icu","hospital","cutoff"},Rule],{InterpolatingFunction::dmval}];

  events=Association[Flatten[evts]];
  prettyEvents={#-><|"eventName" -> #, "day" -> events[#][[1]][[1]], "thresholdCrossed" -> events[#][[1]][[2]]|>}&/@Keys[events];

  endOfYear = 365;
  (* we  chop off the data here with one of either a containment or herd immunity events *)
  endOfEval = If[KeyExistsQ[events, "containment"], events["containment"][[1]][[1]],
    If[KeyExistsQ[events, "cutoff"], events["cutoff"][[1]][[1]],
      endOfYear]];

  Echo["Generating simulations for " <>state<> " in the " scenario["name"] <> " scenario"];

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
  CumulativeReportedHospitalizedQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*#[[QP[CRepHq]]][t])&/@simResults,deciles];
  CurrentlyInfectedQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*#[[QP[Eq]]][t])&/@simResults,deciles];
  CurrentlyInfectiousQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*(#[[QP[ISq]]][t] + #[[QP[IHq]]][t] + #[[QP[ICq]]][t]))&/@simResults,deciles];
  CumulativeInfectionQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*(#[[QP[Deaq]]][t] + #[[QP[RSq]]][t] + #[[QP[RHq]]][t] + #[[QP[RCq]]][t] ))&/@simResults,deciles];
  CumulativeRecoveredQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*(#[[QP[RSq]]][t] + #[[QP[RHq]]][t] + #[[QP[RCq]]][t] ))&/@simResults,deciles];
  RecoveredHospitalizedQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*(#[[QP[RHq]]][t]))&/@simResults,deciles];
  RecoveredCriticalQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*(#[[QP[RCq]]][t]))&/@simResults,deciles];
  CurrentlyHospitalizedQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*#[[QP[HHq]]][t])&/@simResults,deciles];
  CurrentlyCriticalQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*#[[QP[CCq]]][t])&/@simResults,deciles];
  CumulativeEverHospitalizedQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*(#[[QP[HHq]]][t] + #[[QP[RHq]]][t]))&/@simResults,deciles];
  CumulativeEverCriticalQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*(#[[QP[HCq]]][t] + #[[QP[RCq]]][t] + #[[QP[Deaq]]][t]))&/@simResults,deciles];
  SuseptibleQuantiles[t_]:=Quantile[(stateParams["params"]["population"]*(#[[QP[Sq]]][t]))&/@simResults,deciles];

  timeSeriesData = Module[{},
    Table[Association[{
          "day"->t,
          "distancing"->distancing[t],
          "cumulativePcr" -> Merge[{
              <|"confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["positive"]]|>,
              <|"expected"-> stateParams["params"]["population"]*sol[[QP[PCR]]][t]|>,
              Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,PCRQuantiles[t]]]
            },First],
          "cumulativeDeaths" -> Merge[{
              <|"confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, If[KeyExistsQ[Select[stateParams["thisStateData"],(#["day"]==t)&][[1]],"death"],Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["death"],0]]|>,
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
          "cumulativeRecoveries" -> Merge[{
              Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CumulativeRecoveredQuantiles[t]]],
              <|"expected"-> stateParams["params"]["population"]*(sol[[QP[RSq]]][t] + sol[[QP[RHq]]][t] + sol[[QP[RCq]]][t])|>
            }, First],
          "currentlyReportedHospitalized" -> Merge[{
              <|"confirmed"->If[
                  Length[Select[stateParams["hospitalizationCurrentData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["hospitalizationCurrentData"],
                        (#["day"]==t)&][[1]],"hospitalizations"],
                    Select[stateParams["hospitalizationCurrentData"],(#["day"]==t)&][[1]]["hospitalizations"],
                    0
                  ]|>,
              Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyReportedHospitalizedQuantiles[t]]],
              <|"expected"-> stateParams["params"]["population"]*sol[[QP[RepHq]]][t]|>
            },First],
          "currentlyHospitalized" -> Merge[{
              Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyHospitalizedQuantiles[t]]],
              <|"expected"-> stateParams["params"]["population"]*sol[[QP[HHq]]][t]|>
            }, First],
          "cumulativeReportedHospitalized" -> Merge[{
              <|"confirmed"->If[
                  Length[Select[stateParams["hospitalizationCumulativeData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["hospitalizationCumulativeData"],
                        (#["day"]==t)&][[1]],"hospitalizations"],
                    Select[stateParams["hospitalizationCumulativeData"],(#["day"]==t)&][[1]]["hospitalizations"],
                    0
                  ]|>,
              Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CumulativeReportedHospitalizedQuantiles[t]]],
              <|"expected"-> stateParams["params"]["population"]*sol[[QP[CRepHq]]][t]|>
            },First],
          "cumulativeHospitalized" -> Merge[{
              Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&, (CumulativeEverHospitalizedQuantiles[t])]],
              <|"expected"-> stateParams["params"]["population"]*(sol[[QP[HHq]]][t] + sol[[QP[RHq]]][t])|>
            }, First],
          "cumulativeCritical" -> Merge[{
              <|"confirmed"->If[
                  Length[Select[stateParams["icuCumulativeData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["icuCumulativeData"],
                        (#["day"]==t)&][[1]],"icu"],
                    Select[stateParams["icuCumulativeData"],(#["day"]==t)&][[1]]["icu"],
                    0
                  ]|>,
              Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&, (CumulativeEverCriticalQuantiles[t])]],
              <|"expected"-> stateParams["params"]["population"]*(sol[[QP[HCq]]][t] + sol[[QP[RCq]]][t] + sol[[QP[Deaq]]][t])|>
            }, First],
          "currentlyCritical" -> Merge[{
               <|"confirmed"->If[
                  Length[Select[stateParams["icuCurrentData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["icuCurrentData"],
                        (#["day"]==t)&][[1]],"icu"],
                    Select[stateParams["icuCurrentData"],(#["day"]==t)&][[1]]["icu"],
                    0
                  ]|>,
              Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,CurrentlyCriticalQuantiles[t]]],
              <|"expected"-> stateParams["params"]["population"]*sol[[QP[CCq]]][t]|>
            },First],
          "susceptible" -> Merge[{
              Association[MapIndexed[{"percentile"<>ToString[#2[[1]]*10] ->#1}&,SuseptibleQuantiles[t]]],
              <|"expected"-> stateParams["params"]["population"]*sol[[QP[Sq]]][t]|>
            },First]
        }],{t,Floor[fitParams["importtime"]] - 5, endOfEval}]];

  (*Echo[ListLogPlot[{#["day"],#["cumulativePcr"]["expected"]}&/@timeSeriesData,Joined->True,ImageSize->300]];*)

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
    "totalInfectedFraction"->If[KeyExistsQ[events, "containment"],
      CumulativeInfectionQuantiles[containmentTime][[5]] / stateParams["params"]["population"],
      CumulativeInfectionQuantiles[endOfEval][[5]] / stateParams["params"]["population"]],
    "fatalityRate"->If[KeyExistsQ[events, "containment"],
      (DeathQuantiles[containmentTime][[5]]/(CumulativeInfectionQuantiles[containmentTime][[5]])),
      DeathQuantiles[endOfEval][[5]]/(CumulativeInfectionQuantiles[endOfEval][[5]])],
    "fatalityRateSymptomatic"-> (1/fractionSymptomatic0)*If[KeyExistsQ[events, "containment"],
      (DeathQuantiles[containmentTime][[5]]/(CumulativeInfectionQuantiles[containmentTime][[5]])),
      DeathQuantiles[endOfEval][[5]]/(CumulativeInfectionQuantiles[endOfEval][[5]])],
    "fatalityRatePCR"->If[KeyExistsQ[events, "containment"],
      DeathQuantiles[containmentTime][[5]]/PCRQuantiles[containmentTime][[5]],
      DeathQuantiles[endOfEval][[5]]/PCRQuantiles[endOfEval][[5]]],
    "fractionOfInfectionsPCRConfirmed"-> (1/fractionSymptomatic0)*If[KeyExistsQ[events, "containment"],
      (PCRQuantiles[containmentTime][[5]]/(CumulativeInfectionQuantiles[containmentTime][[5]])),
      PCRQuantiles[endOfEval][[5]]/(CumulativeInfectionQuantiles[endOfEval][[5]])],
    "dateContained"->If[KeyExistsQ[events, "containment"],
      DateString[DatePlus[{2020,1,1},containmentTime-1]],
      "-"],
    "dateICUOverCapacity"->If[KeyExistsQ[events, "icu"]&&(!KeyExistsQ[events, "containment"]||(icuOverloadTime - containmentTime)<=0),
      DateString[DatePlus[{2020,1,1},icuOverloadTime-1]],
      "-"],
    "dateHospitalsOverCapacity"->If[KeyExistsQ[events, "hospital"]&&(!KeyExistsQ[events, "containment"]||(hospitalOverloadTime - containmentTime)<=0),
      DateString[DatePlus[{2020,1,1},hospitalOverloadTime-1]],
      "-"]
  |>;

  (* Echo[Column[{Text["Summary of simulatons for "<>state<>" in the "<>scenario["name"]<>" scenario."],summary}]];*)

  Merge[{
      <|"distancingLevel"-> stateDistancingPrecompute[state][scenario["id"]]["distancingLevel"]|>,
      scenario,
      Association[{
          "timeSeriesData"->timeSeriesData,
          "events"->prettyEvents,
          "summary"->summary
        }]}, First]
];



(* evaluate state for all scenarios *)
(* we first fit the data on PCR and fatalities to find the R0 and importtime for that state
then we generate a set of all the simulated parameters. Finally we call evaluateScenario to run and aggregate the
simulation results for each scenario *)
Clear[equationsODE,eventsODE,initialConditions,outputODE,dependentVariablesODE,parameters,DeaqParametric,PCRParametric];
evaluateState[state_, numberOfSimulations_:100]:= Module[{
    distancing,params,percentPositiveCase,longData,thisStateData,model,fit,
    fitParams,icuCapacity,dataWeights,standardErrors,hospitalizationCurrentData,icuCurrentData,hospitalizationCumulativeData,icuCumulativeData,hospitalCapacity,gofMetrics,
    equationsODE,eventsODE,initialConditions,outputODE,dependentVariablesODE,parameters,DeaqParametric,PCRParametric,
    rlower, rupper, tlower, tupper, replower, repupper, deathDataLength,output
  },

  distancing = stateDistancingPrecompute[state]["scenario1"]["distancingFunction"];
  percentPositiveCase[t_]:=posInterpMap[state][t];

  params=stateParams[state];
  icuCapacity=params["icuBeds"]/params["population"];
  hospitalCapacity=(1-params["bedUtilization"])*params["staffedBeds"]/params["population"];
  hospitalizationCurrentData = stateHospitalizationCurrentActualsData[state];
  hospitalizationCumulativeData = stateHospitalizationCumulativeActualsData[state];
  icuCurrentData = stateICUCurrentActualsData[state];
  icuCumulativeData = stateICUCumulativeActualsData[state];


  (* a scoped copy of the ODEs, Thsese do not use heterogeneous susceptibility since they are fit on low I / early t and we fit *)
  (* the import time *)
  equationsODE={
    Sq'[t]==(- k0 * Log[1 + (distancing[t]^distpow*(ISq[t]+IHq[t]+ICq[t])*r0natural)/(k0*daysUntilNotInfectiousOrHospitalized0 )]*Sq[t])-est[t]*Sq[t],
    Eq'[t]==( k0 * Log[1 + (distancing[t]^distpow*(ISq[t]+IHq[t]+ICq[t])*r0natural)/(k0*daysUntilNotInfectiousOrHospitalized0 )]*Sq[t])+est[t]*Sq[t]-Eq[t]/daysFromInfectedToInfectious0,
    (*    Sq'[t]==(-distancing[t]^distpow*r0natural*(ISq[t]+IHq[t]+ICq[t] )*Sq[t])/daysUntilNotInfectiousOrHospitalized0-est[t]*Sq[t],
    Eq'[t]==(distancing[t]^distpow*r0natural*(ISq[t]+IHq[t]+ICq[t] )*Sq[t])/daysUntilNotInfectiousOrHospitalized0+est[t]*Sq[t]-Eq[t]/daysFromInfectedToInfectious0,*)
    (*Infectious total, not yet PCR confirmed,age indep*)
    ISq'[t]==params["pS"]*Eq[t]/daysFromInfectedToInfectious0-ISq[t]/daysUntilNotInfectiousOrHospitalized0,
    (*Recovered without needing care*)
    RSq'[t]==ISq[t]/daysUntilNotInfectiousOrHospitalized0,
    (*Infected and will need hospital, won't need critical care*)
    IHq'[t]==params["pH"]*Eq[t]/daysFromInfectedToInfectious0-IHq[t]/daysUntilNotInfectiousOrHospitalized0,
    (*Going to hospital*)
    HHq'[t]==IHq[t]/daysUntilNotInfectiousOrHospitalized0-HHq[t]/daysToLeaveHosptialNonCritical0,
    (*Reported positive hospital cases*)
    RepHq'[t]==testingProbability[t] * (params["pPCRH"]*HHq[t])/daysForHospitalsToReportCases0,
    (*Cumulative hospitalized count*)
    EHq'[t]==IHq[t]/daysUntilNotInfectiousOrHospitalized0,
    (*Recovered after hospitalization*)
    RHq'[t]==HHq[t]/daysToLeaveHosptialNonCritical0,
    (*pcr confirmation*)
    PCR'[t] == testingProbability[t] * (statesConvergeToValue0/(1+Exp[-(1/(midpointConvergeStateDifferences0-startConvergeStateDifferences0))Log[statesConvergeToValue0/stateAdjustmentForTestingDifferences-1]*(t-midpointConvergeStateDifferences0)])+  stateAdjustmentForTestingDifferences) * (params["pPCRNH"]*ISq[t] + params["pPCRH"]*(IHq[t]+ICq[t])) / (daysToGetTested0),
    (*Infected, will need critical care*)
    ICq'[t]==params["pC"]*Eq[t]/daysFromInfectedToInfectious0-ICq[t]/daysUntilNotInfectiousOrHospitalized0,
    (*Hospitalized,
    need critical care*)
    HCq'[t]==ICq[t]/daysUntilNotInfectiousOrHospitalized0-HCq[t]/daysTogoToCriticalCare0,
    (*Entering critical care*)
    CCq'[t]==HCq[t]/daysTogoToCriticalCare0-CCq[t]/daysFromCriticalToRecoveredOrDeceased0,
    (*Dying*)
    Deaq'[t]==CCq[t]*If[CCq[t]>=icuCapacity,params["fractionOfCriticalDeceased"],params["fractionOfCriticalDeceased"]]/daysFromCriticalToRecoveredOrDeceased0,
    (*Leaving critical care*)
    RCq'[t]==CCq[t]*(1-fractionOfCriticalDeceased0)/daysFromCriticalToRecoveredOrDeceased0,
    est'[t]==0
  }/.Thread[{r0natural,importtime,stateAdjustmentForTestingDifferences,distpow}->fromLog/@{logR0Natural,logImportTime,logStateAdjustmentForTestingDifferences,logDistpow}];
  eventsODE = {
    WhenEvent[t>=importtime,est[t]->Exp[-initialInfectionImpulse0]],
    WhenEvent[t>importtime+importlength0,est[t]->0]
  }/.Thread[{r0natural,importtime,stateAdjustmentForTestingDifferences,distpow}->fromLog/@{logR0Natural,logImportTime,logStateAdjustmentForTestingDifferences,logDistpow}];
  initialConditions = {Sq[0]==1,Eq[0]==0,ISq[0]==0,RSq[0]==0,IHq[0]==0,HHq[0]==0,RepHq[0]==0,RHq[0]==0,ICq[0]==0,HCq[0]==0,CCq[0]==0,RCq[0]==0,Deaq[0]==0,est[0]==0,PCR[0]==0,EHq[0]==0};
  outputODE = {Deaq, PCR};
  dependentVariablesODE = {Deaq, PCR, RSq,RHq, RCq, RepHq, Sq, Eq, ISq, IHq, HHq, ICq, EHq, HCq, CCq, est};
  parameters = {logR0Natural,logImportTime,logStateAdjustmentForTestingDifferences, logDistpow};
  {DeaqParametric,PCRParametric}= {Deaq, PCR}/.ParametricNDSolve[
    {equationsODE, eventsODE, initialConditions},
    outputODE,
    {t,tmin0,tmax0},
    parameters,
    DependentVariables->dependentVariablesODE,
    Method->{"DiscontinuityProcessing"->False}
  ];

  {rlower, rupper, tlower, tupper, replower, repupper}=getBounds[state];

  thisStateData=Select[parsedData,(#["state"]==state&&#["positive"]>0)&];

  longData=Select[Join[
      {1,#["day"],If[TrueQ[#["death"]==Null],0,(#["death"]/params["population"])//N]}&/@thisStateData,
      {2,#["day"],(#["positive"]/params["population"])//N}&/@thisStateData
    ],#[[3]]>0&];
  deathDataLength=Length[Select[longData,#[[1]]==1&]];

  model[r0natural_,importtime_,stateAdjustmentForTestingDifferences_,distpow_,c_][t_]:=Piecewise[{
      {DeaqParametric[r0natural,importtime,stateAdjustmentForTestingDifferences, distpow][t],c==1},
      {PCRParametric[r0natural,importtime,stateAdjustmentForTestingDifferences, distpow][t] ,c==2}
    }];

  (* Weight death and PCR test data appropriatly. Factors include: *)
  (*   weekOverWeekWeight: weights later data more heavily *)
  (*   poissonWeight: weights data assuming its uncertainty is poisson *)
  (*   boostDeathWeight: increases the weighting of deaths by some factor *)
  dataWeights=Module[{weekOverWeekWeight,poissonWeight,boostDeathWeight},
    weekOverWeekWeight[factor_]:=Map[(factor^(-#[[2]]/7))&,longData];
    poissonWeight:=Map[((params["population"]#[[3]])^-1)&,longData];
    boostDeathWeight[factor_]:=Map[If[First[#]==1,factor,1]&,longData];
    poissonWeight * weekOverWeekWeight[.85] * boostDeathWeight[3]
  ];

  (* the fitting function tries t=0 even though we start on t=1, quiet is to avoid annoying warning that isn't helpful *)
  fit=Quiet[NonlinearModelFit[
      longData,
      {
        model[r0natural,importtime,stateAdjustmentForTestingDifferences,distpow,c][t],
        Log[rlower]<=r0natural<=Log[rupper],
        Log[tlower]<=importtime<=Log[tupper],
        Log[1]<=distpow<= Log[2],
        Log[replower]<= stateAdjustmentForTestingDifferences<=Log[repupper]
      },
      {
        {r0natural,Log[(rlower+rupper)/2]},
        {importtime,Log[(tlower+tupper)/2]},
        {stateAdjustmentForTestingDifferences,Log[(replower+repupper)/2]},
        {distpow, 1}
      },{c,t},
      Method->{"NMinimize",Method->{"SimulatedAnnealing", "RandomSeed"->111}},
      Weights->dataWeights(*,
      EvaluationMonitor :> Print["r0natural=", Exp[r0natural], ".    importtime=", Exp[importtime], ".    stateAdjustmentForTestingDifferences=", Exp[stateAdjustmentForTestingDifferences]]*)
    ], {InterpolatingFunction::dmval}
  ];

  fitParams=Exp[#]&/@KeyMap[ToString[#]&, Association[fit["BestFitParameters"]]];
  (* TODO: try using VarianceEstimatorFunction\[Rule](1&) *)
  (* quiet because of constraint boundary warning -- we have constraints so as to prevent certain local minima from happening
	in the SimulatedAnnealing global search, but intentionally choose vallues of the constraint boundary so that the fit is unlikely to run into the boundary
	and thus we feel okay about using the variance estimates *)
  standardErrors=Quiet[Quiet[Exp[#]&/@KeyMap[ToString[#]&, AssociationThread[{r0natural,importtime,stateAdjustmentForTestingDifferences,distpow},
          fit["ParameterErrors", ConfidenceLevel->0.97]]], {FittedModel::constr}], {InterpolatingFunction::dmval}];
  gofMetrics=goodnessOfFitMetrics[fit["FitResiduals"],longData,params["population"]];

  Echo[gofMetrics];

  Echo[
    Column[{
        Text["Fit for "<>state],
        Row[{
            Show[
              ListLogPlot[Cases[longData,{#, t_,c_}:>{t,c}]&/@{1,2},ImageSize->500,PlotRange->{{40,150},{0,Automatic}}],
              LogPlot[{
                  DeaqParametric[Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t],
                  PCRParametric[
                    Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t]},
                {t,40,150},ImageSize->500]],
            ListPlot[{
                Thread[{#2,#1/#3}&[
                    fit["FitResiduals"][[1;;deathDataLength]],
                    (#[[2]]&/@longData[[1;;deathDataLength]]),
                    (#[[3]]&/@longData[[1;;deathDataLength]])
                  ]],
                Thread[{#2,#1/#3}&[
                    fit["FitResiduals"][[deathDataLength+1;;Length[longData]]],
                    Reverse[(#[[2]]&/@longData[[deathDataLength+1;;Length[longData]]])],
                    Reverse[(#[[3]]&/@longData[[deathDataLength+1;;Length[longData]]])]
                  ]]
              },ImageSize->500, Filling->Axis]
          }],
        Row[{fromLog@fit["ParameterTable"]//Quiet,fit["ANOVATable"]//Quiet}]
      }]
  ];


  output = Merge[{
      <|"scenarios"->
        Association[{#["id"]->evaluateScenario[state,fitParams,standardErrors,
              <|"params"->params,
                "thisStateData"->thisStateData,
                "icuCapacity"->icuCapacity,
                "hospitalCapacity"->hospitalCapacity,
                "hospitalizationCurrentData" -> hospitalizationCurrentData,
                "hospitalizationCumulativeData" -> hospitalizationCumulativeData,
                "icuCurrentData" -> icuCurrentData,
                "icuCumulativeData" -> icuCumulativeData
              |>, #, numberOfSimulations]}&/@scenarios]|>,
      <|"parameterBest"->fitParams|>,
      KeyDrop[stateParams[state],{"R0","importtime0"}],
      "r0"->fitParams["r0natural"],
      "importtime"->fitParams["importtime"],
      "stateAdjustmentForTestingDifferences"->fitParams["stateAdjustmentForTestingDifferences"],
      "distpow"->fitParams["distpow"],
      "longData"->longData,
      "goodnessOfFitMetrics"->gofMetrics
    }, First];
    
    Echo[plotStateHospitalization[output, state]];
    
    output
]


(* export the full model data, Warning: paralllize will eat a lot of laptop resources while it evaluates *)
evaluateStateAndPrint[state_, simulationsPerCombo_:1000]:=Module[{},
  Print["Fitting model for " <> state];
  evaluateState[state, simulationsPerCombo]
];

generateSummaryForState[data_, state_]:= Module[{},
  Join[{state},Values[Association[Join[
          KeyDrop[KeyDrop[KeyDrop[data["scenarios"][#],"timeSeriesData"],"events"],"summary"],
          data["scenarios"][#]["summary"]
        ]]],
    {
      data["r0"],
      data["importtime"],
      data["stateAdjustmentForTestingDifferences"]
    }
  ]&/@Keys[data["scenarios"]]
];


exportAllStatesSummary[allStates_]:=Module[{header, rows, table},
  header = {Append[Prepend[Keys[
          Association[Join[
              KeyDrop[KeyDrop[KeyDrop[allStates[Keys[allStates][[1]]]["scenarios"]["scenario1"],"timeSeriesData"],"events"],"summary"],
              allStates[Keys[allStates][[1]]]["scenarios"]["scenario1"]["summary"]
            ]]],"state"], {"r0natural","importtime","stateAdjustmentForTestingDifferences"}]};
  rows = generateSummaryForState[allStates[#],#]&/@Keys[allStates];

  table = Flatten[Join[{header}, rows],1];


  Export["tests/summary.csv", table];
]

(* the main utility for generating fits / simulations for each state. pass a simulation count to the first
argument and an array of two letter state code strings to the second *)
(* this will write JSON out to the respective state files and the change can be previewd on localhost:3000
when running the web server *)
GenerateModelExport[simulationsPerCombo_:1000, states_:Keys[stateDistancingPrecompute]] := Module[{},
  loopBody[state_]:=Module[{stateData},
    stateData=evaluateStateAndPrint[state, simulationsPerCombo];
    
    Export["public/json/"<>state<>".json",stateData]; 
    stateData
  ];

  allStatesData=Association[Parallelize[Map[(#->loopBody[#])&,states]]];

  exportAllStatesSummary[allStatesData];

  exportAllStatesGoodnessOfFitMetricsCsv["tests/gof-metrics.csv",allStatesData];
  exportAllStatesGoodnessOfFitMetricsSvg["tests/relative-fit-errors.svg",allStatesData];
  (*exportAllStatesHospitalizationGoodnessOfFitMetricsSvg["tests/hospitalization-relative-fit-errors.svg",allStatesData];*)
  allStatesData
]


(* TODO:: re-incorporate to validate assumed parameters *)
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



