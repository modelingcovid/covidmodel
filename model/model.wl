(* ::Package:: *)

(** Model parameters. See https://docs.google.com/spreadsheets/d/1DH58EFf_YkWHa_zn8-onBGzsYFMamjSjOItr137vu9g/edit#gid=0 **)
SetDirectory[$UserDocumentsDirectory<>"/Github/covidmodel"];

Import["model/data.wl"];
Import["model/gof-metrics.wl"];
Import["model/plot-utils.wl"];

(* to do a quick run GenerateModelExport[100, testCaseStates] *)
testCaseStates={"CA","VA","FL","CO", "MD","TX","WA","OR", "PA", "CT", "OH", "VT"};


(*Rate of progressing to infectiousness, days*)
daysFromInfectedToInfectious0 = 4;
daysFromInfectedToSymptomatic0 = 5;

(*Rate of losing infectiousness or going to the hospital*)
daysUntilNotInfectious0 = 5;
daysUntilHospitalized0 = 7;

(*Rate of leaving hospital for those not going to critical care*)
daysToLeaveHosptialNonCritical0 = 12;

(*Rate of leaving hospital and going to critical care*)
daysTogoToCriticalCare0 = 1.5;

(*Rate of leaving critical care, weeks*)
daysFromCriticalToRecoveredOrDeceased0 = 10;

(* probabilities of getting pcr confirmations given hospitalized / non-hospitalized resp *)
pPCRH0 = 0.8;
pPCRNH0 = 0.13;

(* How out of date are reports of hospitalizations? *)
daysForHospitalsToReportCases0 = 1.5;
(* days to get tested after infectious *)
daysToGetTested0 = 7.5;

(* the penalty to fatailty rate in the case patients cannot get ICU care *)
icuOverloadDeathPenalty0 = 1;

(* virus start parameters *)
initialInfectionPeople0 = 10;

(*Duration of pulse in force of infection for establishment, days*)
importlength0 = 3;

(*Fraction of critical patents who pass *)
fractionOfCriticalDeceased0 = 0.4;
(*Fraction deceased from hospital who dont make it to critical care (clear it happens from NY cumulative ICU numbers) *)
(* currently unused, but we should figure out if it makes sense to add *)
fractionOfHospitalizedNonCriticalDeceased0 = 0.05;

(* interpret as: steepness of age depencence*)
medianHospitalizationAge0 = 61;

(* interpret as: steepness of age depencence*)
ageCriticalDependence0 = 3;
ageHospitalizedDependence0 = 15;

(* percent positive test delay *)
percentPositiveTestDelay0 = 11;

(* probability that an infected 80 year old will require critical care *)
pCritical80YearOld0=0.1125;

(* probability that an infecteed 80 year old will need hospitalization but not critical care *)
pHospitalized80YearOld0=0.165;

statesConvergeToValue=1.8;
convergenceMidpoint=100+30; (*30 days from now *)
convergencePeriod=60; (* 90% 2 months from now *)
convergenceFunction[stateRate_,t_]:=stateRate+(statesConvergeToValue-stateRate)LogisticSigmoid[(t-convergenceMidpoint)*5.88888/convergencePeriod];

(* not used in model only for output *)
testToAllCaseRatio0=100;

(* Fraction of symptomatic cases *)
fractionSymptomatic0 = 0.7;

(* Set heterogeneous susceptibility using lognormal function with bins of constant population size *)
susceptibilityBins=5;
susceptibilityValuesLogNormal[binCount_,stdDev_]:=Module[{m,s,dist,binEdges},
  m=-stdDev^2/2;
  s=Sqrt[Log[stdDev^2+1]];
  dist=LogNormalDistribution[m,s];
  binEdges=InverseCDF[dist,Range[0,binCount]/binCount];
  Table[
    NIntegrate[x PDF[dist,x],{x,binEdges[[i]],binEdges[[i+1]]}],{i,1,binCount}]//(binCount #/Total[#])&
];
susceptibilityValues=susceptibilityValuesLogNormal[susceptibilityBins,1];
susceptibilityInitialPopulations=ConstantArray[1/susceptibilityBins,susceptibilityBins];



(* to help the numerical optimizer we give slightly different problem bounds depening on state
based on eg their epidemics starting earlier or having different hospital systems and thus a different
gap between PCR and death *)
(* In the future a proposal for how to fix this is to run a meta fit varying the bounds around reasonable ranges
and starting with a different random seed, then pick the best one (the real one that didnt get stuck hopefully) *)
fitStartingOverrides=<|
  "AZ"-><|"rlower"->3,"rupper"->4,"tlower"->35,"tupper"->75,"replower"->0.6,"repupper"->0.8|>,
  "CA"-><|"rlower"->3.1,"rupper"->4.5,"tlower"->35,"tupper"->42,"replower"->0.7,"repupper"->0.8|>,
  "FL"-><|"rlower"->3.6,"rupper"->4.2,"tlower"->38,"tupper"->75,"replower"->0.9,"repupper"->1.2|>,
  "PA"-><|"rlower"->4.7,"rupper"->5,"tlower"->47,"tupper"->49.5,"replower"->0.90,"repupper"->1.1|>,
  "CO"-><|"rlower"->3.3,"rupper"->4.4,"tlower"->35,"tupper"->75,"replower"->0.5,"repupper"->0.65|>,
  "TX"-><|"rlower"->3,"rupper"->4.8,"tlower"->35,"tupper"->75,"replower"->0.5,"repupper"->0.8|>,
  "WA"-><|"rlower"->2.3,"rupper"->3.5,"tlower"->10,"tupper"->15,"replower"->0.56,"repupper"->0.9|>,
  "CT"-><|"rlower"->4,"rupper"->5,"tlower"->35,"tupper"->48,"replower"->0.3,"repupper"->0.6|>,
  "OH"-><|"rlower"->3.5,"rupper"->4.5,"tlower"->40,"tupper"->51,"replower"->0.1,"repupper"->0.5|>,
  "NY"-><|"rlower"->4,"rupper"->5,"tlower"->30,"tupper"->35,"replower"->0.45,"repupper"->0.7|>,
  "VA"-><|"rlower"->3.4,"rupper"->4.2,"tlower"->35,"tupper"->75,"replower"->0.6,"repupper"->1|>,
  "VT"-><|"rlower"->3,"rupper"->4,"tlower"->35,"tupper"->75,"replower"->0.2,"repupper"->0.5|>,
  "LA"-><|"rlower"->4.1,"rupper"->4.5,"tlower"->35,"tupper"->75,"replower"->0.3,"repupper"->0.45|>,
  "MI"-><|"rlower"->4.5,"rupper"->5,"tlower"->35,"tupper"->75,"replower"->0.3,"repupper"->0.4|>,
  "MS"-><|"rlower"->2.7,"rupper"->5,"tlower"->35,"tupper"->75,"replower"->0.5,"repupper"->0.6|>,
  "MA"-><|"rlower"->4,"rupper"->5,"tlower"->35,"tupper"->47,"replower"->0.65,"repupper"->1|>,
  "MD"-><|"rlower"->3.4,"rupper"->5,"tlower"->48,"tupper"->75,"replower"->0.6,"repupper"->1|>,
  "GA"-><|"rlower"->3.3,"rupper"->4,"tlower"->35,"tupper"->75,"replower"->0.2,"repupper"->0.6|>,
  "NJ"-><|"rlower"->5.6,"rupper"->6,"tlower"->45,"tupper"->47,"replower"->0.6,"repupper"->1|>,
  "IL"-><|"rlower"->4,"rupper"->5,"tlower"->46,"tupper"->75,"replower"->0.3,"repupper"->0.7|>,
  "IN"-><|"rlower"->3.5,"rupper"->5,"tlower"->35,"tupper"->75,"replower"->0.25,"repupper"->0.45|>,
  "OK"-><|"rlower"->3,"rupper"->4,"tlower"->35,"tupper"->75,"replower"->0.3,"repupper"->0.5|>,
  "WI"-><|"rlower"->3.4,"rupper"->4.3,"tlower"->35,"tupper"->75,"replower"->0.45,"repupper"->0.8|>,
  "NV"-><|"rlower"->3.6,"rupper"->4.3,"tlower"->35,"tupper"->75,"replower"->0.5,"repupper"->1.2|>,
  "OR"-><|"rlower"->2.8,"rupper"->4,"tlower"->35,"tupper"->72,"replower"->0.5,"repupper"->1.1|>,
  "SC"-><|"rlower"->2.8,"rupper"->4.6,"tlower"->35,"tupper"->75,"replower"->0.6,"repupper"->0.7|>
|>;

getBounds[state_]:=Module[{},
  If[MemberQ[Keys[fitStartingOverrides],state],
    {fitStartingOverrides[state]["rlower"],fitStartingOverrides[state]["rupper"],fitStartingOverrides[state]["tlower"],fitStartingOverrides[state]["tupper"],fitStartingOverrides[state]["replower"],fitStartingOverrides[state]["repupper"]},
    {2.5,5,35,75,0.1,2}]
];

(* define some helper distributions and set up all the parameters that need to be simulated *)
BetaMeanSig[mu_,sig_]:=BetaDistribution[(mu^2-mu^3-mu sig)/sig,((-1+mu) (-mu+mu^2+sig))/sig];
PosNormal[mu_,sig_]:=TruncatedDistribution[{0,\[Infinity]},NormalDistribution[mu,sig]]

(* a function to generate the monte carlo simulations from combo of fit / assumed parameters *)
(* for the assumed parameters we temporarily have a 5% stdev, but we will replace this with a calculated
one when we have multiple literature sources shortly *)
generateSimulations[numberOfSimulations_, fitParams_, standardErrors_, cutoff_, stateParams_]:=Module[{}, {
    RandomVariate[PosNormal[fitParams["r0natural"],0.05*fitParams["r0natural"]]],
    RandomVariate[PosNormal[daysUntilNotInfectious0,daysUntilNotInfectious0*0.05]],
    RandomVariate[PosNormal[daysUntilHospitalized0,daysUntilHospitalized0*0.05]],
    RandomVariate[PosNormal[daysFromInfectedToInfectious0,daysFromInfectedToInfectious0*0.05]],
    RandomVariate[PosNormal[daysToLeaveHosptialNonCritical0,daysToLeaveHosptialNonCritical0*0.05]],
    RandomVariate[PosNormal[stateParams["params"]["pPCRNH"],stateParams["params"]["pPCRNH"]*0.05]],
    RandomVariate[PosNormal[stateParams["params"]["pPCRH"],stateParams["params"]["pPCRH"]*0.05]],
    RandomVariate[PosNormal[daysTogoToCriticalCare0,daysTogoToCriticalCare0*0.05]],
    RandomVariate[PosNormal[daysFromCriticalToRecoveredOrDeceased0,daysFromCriticalToRecoveredOrDeceased0*0.05]],
    RandomVariate[BetaMeanSig[fractionOfCriticalDeceased0,fractionOfCriticalDeceased0*0.02]],
    RandomVariate[PosNormal[fitParams["importtime"],0.05*fitParams["importtime"]]],
    RandomVariate[PosNormal[importlength0,importlength0*0.05]],
    RandomVariate[PosNormal[stateParams["params"]["initialInfectionImpulse"],stateParams["params"]["initialInfectionImpulse"]*0.05]],
    cutoff,
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"],
    RandomVariate[PosNormal[fitParams["stateAdjustmentForTestingDifferences"], 0.05*fitParams["stateAdjustmentForTestingDifferences"]]],
    RandomVariate[PosNormal[fitParams["distpow"], 0.05*fitParams["distpow"]]]
  }&/@Range[numberOfSimulations]]



(* Assumption here is that age dependence follows a logistic curve -- zero year olds dont require any care, 
100 year olds require significant case, midpoint is the medianHospitalization age *)
infectedCritical[a_] :=
pCritical80YearOld0(1+E^((-80+medianHospitalizationAge0)/ageCriticalDependence0)) 1/(1+Exp[-((a-medianHospitalizationAge0)/ageCriticalDependence0)]);

(* distribution from CDC scaled to our PCR rate 
https://docs.google.com/spreadsheets/d/1N4cMGvi1y7nRJP_dvov2iaAnJlXcr2shWhHZhhI4_qA/edit#gid=0 *)
(*hospdist={{10,32,50,60,70,80,87}, {0.007,0.05824,0.07924,0.08428,0.1218,0.16436,0.19684}};
hospAgeModel=NonlinearModelFit[Transpose@{hospdist[[1]],hospdist[[2]]},0.25/(1+Exp[-(x-x0)/k]),{k,x0},x];
hospAgeModel["BestFitParameters"];
infectedHospitalized[a_]:=hospAgeModel[a]/fractionSymptomatic0;*)

infectedHospitalized[a_] :=
pHospitalized80YearOld0(1+E^((-80+medianHospitalizationAge0)/ageHospitalizedDependence0)) 1/(1+Exp[-((a-medianHospitalizationAge0)/ageHospitalizedDependence0)]);

noCare[a_] :=
1-infectedCritical[a]-infectedHospitalized[a];

(* test for the overall fraction that end up in the ICU out of all hospitalized *)
(*1/Sum[stateParams[state]["population"],{state,statesWithRates}]Sum[stateParams[state]["pC"]/(stateParams[state]["pH"]+stateParams[state]["pC"])*stateParams[state]["population"],{state,statesWithRates}]*)

(* fit the PCR age distribution to lousiana data *)
(* distribution from https://docs.google.com/spreadsheets/d/1N4cMGvi1y7nRJP_dvov2iaAnJlXcr2shWhHZhhI4_qA/edit#gid=1050365393 *)
(* age distribution from wolfram *)
{wid,posmid,tot,pop}={{18,12,10,10,10,10}, {9,23.5,35,45,55,65}, {123,1247,2048,2395,2737,2306}, {1112733,801901,623237,563402,625430,506630}};
proppcrage=Transpose@{posmid,tot/(wid*pop)}//N;
pcrModel=NonlinearModelFit[proppcrage,0.00048/(1+Exp[-k(x-x0)]),{k,x0},x];
pPCRNH0adj=(x/.Solve[Total[Sum[pcrModel[a]*x*100/NIntegrate[pcrModel[b],{b,0,100}]*stateRawDemographicData[#]["Distribution"][[Position[stateRawDemographicData[#]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[#]["Buckets"]}]&/@statesWithRates]/Length[statesWithRates]==pPCRNH0,x])[[1]];
pPCRH0adj=(x/.Solve[Total[Sum[pcrModel[a]*x*100/NIntegrate[pcrModel[b],{b,0,100}]*stateRawDemographicData[#]["Distribution"][[Position[stateRawDemographicData[#]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[#]["Buckets"]}]&/@statesWithRates]/Length[statesWithRates]==pPCRH0,x])[[1]];
pPCRage[a_,adj_]:=pcrModel[a]*adj*100/NIntegrate[pcrModel[b],{b,0,100}];
pPCRNH0State[state_]:=Sum[pPCRage[a,pPCRNH0adj]*stateRawDemographicData[state]["Distribution"][[Position[stateRawDemographicData[state]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[state]["Buckets"]}]
pPCRH0State[state_]:=Sum[pPCRage[a,pPCRH0adj]*stateRawDemographicData[state]["Distribution"][[Position[stateRawDemographicData[state]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[state]["Buckets"]}]

(* fit the spread of the fraction of critical deceased to the death age distribution *)
deathdist={{10,22.5,50,60,70,80,92},{0,0.001,0.005,0.014,0.027,0.043,0.104}};
deathAgeModel=NonlinearModelFit[Transpose@{deathdist[[1]],deathdist[[2]]},0.11/(1+Exp[-k(x-x0)]),{k,x0},x];
criticalDeceasedAge[a_,adj_]:=deathAgeModel[a]*adj*100/NIntegrate[deathAgeModel[b],{b,0,100}];
deceasedAdjustWeight=(x/.Solve[Total[Sum[deathAgeModel[a]*x*100/NIntegrate[deathAgeModel[b],{b,0,100}]*stateRawDemographicData[#]["Distribution"][[Position[stateRawDemographicData[#]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[#]["Buckets"]}]&/@statesWithRates]/Length[statesWithRates]==fractionOfCriticalDeceased0,x])[[1]];
criticalDeceasedState[state_]:=Sum[criticalDeceasedAge[a,deceasedAdjustWeight ]*stateRawDemographicData[state]["Distribution"][[Position[stateRawDemographicData[state]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[state]["Buckets"]}]

getStateParams[state_]:=Module[{raw,pop,dist,buckets},
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
    "pS"->Sum[noCare[a]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
    "pH"->Sum[infectedHospitalized[a]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
    "pC"->Sum[infectedCritical[a]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
    "pPCRNH"->pPCRNH0State[state],
    "pPCRH"->pPCRH0State[state],
    "fractionOfCriticalDeceased"->criticalDeceasedState[state],
    "initialInfectionImpulse"->-Log[initialInfectionPeople0/(importlength0*pop)]//N
  |>
];

stateParams = Association[{#->getStateParams[#]}&/@Keys[fitStartingOverrides]];


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

(* a set of parameters take from California that can be used for code testing purposes *)
generateModelComponents[distancing_] := <|
  "equationsODE" -> Flatten[{
      (* susceptible, binned by susceptibility; the sum of all sSq[i]'s would be Sq, the full susceptible population *)
      Table[sSq[i]'[t]==-distancing[t]^distpow * r0natural * (ISq[t] / daysUntilNotInfectious + (IHq[t]+ICq[t]) / daysUntilHospitalized) * susceptibilityValues[[i]]*sSq[i][t] - est[t]*sSq[i][t],
        {i,1,susceptibilityBins}],
      (* Exposed *)
      Eq'[t]==distancing[t]^distpow * r0natural *  (ISq[t] / daysUntilNotInfectious + (IHq[t]+ICq[t]) / daysUntilHospitalized) * Sum[susceptibilityValues[[i]]*sSq[i][t],{i,1,susceptibilityBins}] + est[t]*Sum[sSq[i][t],{i,1,susceptibilityBins}] - Eq[t]/daysFromInfectedToInfectious,
      (*Infectious total, not yet PCR confirmed,age indep*)
      ISq'[t]==pS*Eq[t]/daysFromInfectedToInfectious-ISq[t]/daysUntilNotInfectious,
      (*Recovered without needing care*)
      RSq'[t]==ISq[t]/daysUntilNotInfectious,
      (*Infected and will need hospital, won't need critical care*)
      IHq'[t]==pH*Eq[t]/daysFromInfectedToInfectious-IHq[t]/daysUntilHospitalized,
      (*Going to hospital*)
      HHq'[t]==IHq[t]/daysUntilHospitalized-HHq[t]/daysToLeaveHosptialNonCritical,
      (*Cumulative Total *)
      cumEq'[t]==distancing[t]^distpow * r0natural *  (ISq[t] / daysUntilNotInfectious + (IHq[t]+ICq[t]) / daysUntilHospitalized) * Sum[susceptibilityValues[[i]]*sSq[i][t],{i,1,susceptibilityBins}] + est[t]*Sum[sSq[i][t],{i,1,susceptibilityBins}],
      (*Cumulative reported positive hospital cases*)
      RepHq'[t]== testingProbability[t] * pPCRH * convergenceFunction[stateAdjustmentForTestingDifferences,t] * IHq[t]/daysUntilHospitalized,
      (*Cumulative reported ICU cases *)
      RepHCq'[t]== testingProbability[t] * pPCRH * convergenceFunction[stateAdjustmentForTestingDifferences,t] * ICq[t] / daysUntilHospitalized,
      (*Cumulative hospitalized count*)
      EHq'[t]==(IHq[t]) / daysUntilHospitalized,
      (*Cumulative critical count*)
      EHCq'[t]==(ICq[t]) / daysUntilHospitalized,
      (*Recovered after hospitalization*)
      RHq'[t]==HHq[t]*(1-fractionOfHospitalizedNonCriticalDeceased0)/daysToLeaveHosptialNonCritical,
      (*pcr confirmation*)
      PCR'[t] == testingProbability[t] * pPCRNH * convergenceFunction[stateAdjustmentForTestingDifferences,t] * pS * Eq[t]/daysFromInfectedToInfectious + RepHq'[t] + RepHCq'[t],
      (*Infected, will need critical care*)
      ICq'[t]==pC*Eq[t]/daysFromInfectedToInfectious - ICq[t]/daysUntilHospitalized,
      (*Hospitalized, need critical care*)
      HCq'[t]==ICq[t]/daysUntilHospitalized-HCq[t]/daysTogoToCriticalCare,
      (*Entering critical care*)
      CCq'[t]==HCq[t]/daysTogoToCriticalCare-CCq[t]/daysFromCriticalToRecoveredOrDeceased,
      (*Dying*)
      Deaq'[t]==testingProbability[t] * CCq[t]*If[CCq[t]>=icuCapacity,fractionOfCriticalDeceased,fractionOfCriticalDeceased]/daysFromCriticalToRecoveredOrDeceased + HHq[t]*fractionOfHospitalizedNonCriticalDeceased0/daysFromCriticalToRecoveredOrDeceased,
      (*Leaving critical care*)
      RCq'[t]==CCq[t]*(1-fractionOfCriticalDeceased)/daysFromCriticalToRecoveredOrDeceased,
      (* establishment *)
      est'[t]==0}],

  "simulationEvents" -> {
    WhenEvent[RSq[t]+RSq[t]+RCq[t]>=0.7,Sow[{t,RSq[t]+RSq[t]+RCq[t]},"herd"]],
    WhenEvent[CCq[t]>=icuCapacity,Sow[{t,CCq[t]},"icu"]],(*ICU Capacity overshot*)
    WhenEvent[HHq[t]>=hospitalCapacity,Sow[{t,HHq[t]},"hospital"]],(*Hospitals Capacity overshot*)
    WhenEvent[t>=importtime,est[t]->Exp[-initialInfectionImpulse]],
    WhenEvent[t>importtime+importlength,est[t]->0]},

  "parametricFitEvents" -> {
    WhenEvent[t>=importtime,est[t]->Exp[-initialInfectionImpulse]],
    WhenEvent[t>importtime+importlength0,est[t]->0]
  },

  "initialConditions" -> Flatten[{
      Table[sSq[i][tmin0]==susceptibilityInitialPopulations[[i]],{i,1,susceptibilityBins}],
      Eq[tmin0]==0,ISq[tmin0]==0,RSq[tmin0]==0,IHq[tmin0]==0,HHq[tmin0]==0,
      RepHq[tmin0]==0,RepHCq[tmin0]==0,RHq[tmin0]==0,ICq[tmin0]==0,HCq[tmin0]==0,CCq[tmin0]==0,RCq[tmin0]==0,
      Deaq[tmin0]==0,est[tmin0]==0,PCR[tmin0]==0,EHq[tmin0]==0,EHCq[tmin0]==0,cumEq[tmin0]==0}],

  "outputFunctions" -> Flatten[{
      Table[sSq[i],{i,1,susceptibilityBins}],
      Deaq, PCR, RepHq, RepHCq, Eq, ISq, RSq, IHq, HHq, RHq, ICq, EHq, EHCq, HCq, CCq, RCq, est, cumEq}],

  "dependentVariables" -> Flatten[{
      Table[sSq[i],{i,1,susceptibilityBins}],
      Deaq, PCR, RepHq, RepHCq, Eq, ISq, RSq, IHq, HHq, RHq, ICq, EHq, EHCq, HCq, CCq, RCq, est, cumEq}],

  "simulationParameters" -> {
    r0natural,
    daysUntilNotInfectious,
    daysUntilHospitalized,
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
    icuCapacity,
    hospitalCapacity,
    stateAdjustmentForTestingDifferences,
    distpow
  },

  "replaceKnownParameters"->Function[state, {
      daysUntilNotInfectious -> daysUntilNotInfectious0,
      daysUntilHospitalized -> daysUntilHospitalized0,
      daysFromInfectedToInfectious -> daysFromInfectedToInfectious0,
      daysToLeaveHosptialNonCritical -> daysToLeaveHosptialNonCritical0,
      daysTogoToCriticalCare->daysTogoToCriticalCare0,
      daysFromCriticalToRecoveredOrDeceased -> daysFromCriticalToRecoveredOrDeceased0,
      fractionOfCriticalDeceased -> fractionOfCriticalDeceased0,
      importlength -> importlength0,
      initialInfectionImpulse -> stateParams[state]["initialInfectionImpulse"],
      tmax -> tmax0,
      pS -> stateParams[state]["pS"],
      pH -> stateParams[state]["pH"],
      pC -> stateParams[state]["pC"],
      pPCRNH -> stateParams[state]["pPCRNH"],
      pPCRH -> stateParams[state]["pPCRH"],
      icuCapacity -> stateParams[state]["icuBeds"]/stateParams[state]["population"],
      hospitalCapacity -> (1-stateParams[state]["bedUtilization"])*stateParams[state]["staffedBeds"]/stateParams[state]["population"]
  }],

  "simulationTestParameters" -> {
    3.315677597140117`,5,7,4,12,0.0480977695615949`,0.7695643129855184`,
    4,10,0.3575906619299291`,52.460287850366974`,3,12.5`,730,0.9015240847617458`,
    0.07427433850312418`,0.024201576735129928`,0.00017764223326223455`,0.0009525570076091405`,
    1.3130347650158096`,1.5775877732714718`}
|>;

getModelComponentsForState[state_] := Association[{#["id"]->generateModelComponents[stateDistancingPrecompute[state][#["id"]]["distancingFunction"]]}&/@scenarios];
getSimModelComponentsForState[state_]:= Association[{#["id"]->Module[{modelComponents, equationsODE, initialConditions, outputODE, dependentVariables, eventsODE, parameters, parameterizedSolution},
   modelComponents = generateModelComponents[stateDistancingPrecompute[state][#["id"]]["distancingFunction"]];
   equationsODE = modelComponents["equationsODE"];
   initialConditions = modelComponents["initialConditions"];
   outputODE = modelComponents["outputFunctions"];
   dependentVariables = modelComponents["dependentVariables"];

   eventsODE = modelComponents["simulationEvents"];
   parameters = modelComponents["simulationParameters"];
  
   parameterizedSolution = ParametricNDSolveValue[{
          equationsODE,
          eventsODE,
          initialConditions
        },
        outputODE,
        {t,tmin0,tmax},
        parameters,
        DependentVariables->dependentVariables,
        Method->{"DiscontinuityProcessing"->False}
      ];
      
      <|
        "parameterizedSolution" -> parameterizedSolution,
        "outputODE" -> outputODE
      |>
   
   ]}&/@scenarios];


modelPrecompute = Association[{#->getModelComponentsForState[#]}&/@Keys[fitStartingOverrides]];

simModelPrecompute = Association[{#->getSimModelComponentsForState[#]}&/@Keys[fitStartingOverrides]];


integrateModel[state_, scenarioId_, simulationParameters_]:=Module[{
    modelComponents,
    equationsODE,
    eventsODE,
    initialConditions,
    outputODE,
    dependentVariables,
    parameters,
    outputSolution,
    outputSolutionRules,
    outputEvents,
    time,
    soln,
    parameterizedSolution
  },
  
  modelComponents = simModelPrecompute[state][scenarioId];
  
  outputODE = modelComponents["outputODE"];
  parameterizedSolution = modelComponents["parameterizedSolution"];

  {outputSolution, outputEvents} = Reap[
    Apply[parameterizedSolution, simulationParameters],
    {"containment","herd","icu","hospital","cutoff"},
    List
  ];

  outputSolution = Association[
    MapThread[#1->#2&,{outputODE,outputSolution}]];

  outputSolution = Join[
    outputSolution,
    <|
      Sq->(Sum[outputSolution[s][#],{s,Cases[outputODE,sSq[_]]}]&),
      Iq->(outputSolution[ISq][#]+outputSolution[IHq][#]+outputSolution[ICq][#]&),
      Rq->(outputSolution[RSq][#]+outputSolution[RHq][#]+outputSolution[RCq][#]&)
     |>
  ];

  outputEvents = Association[Table[
      event[[1]]-><|
        "eventName"->event[[1]],
        "day"->event[[2,1,1]],
        "thresholdCrossed"->event[[2,1,2]]|>,
      {event,Flatten[outputEvents,1]}]];

  {outputSolution, outputEvents}
];


integrateModelSim[parameterizedSolution_, outputODE_, simulationParameters_]:=Module[{
    modelComponents,
    equationsODE,
    eventsODE,
    initialConditions,
    dependentVariables,
    parameters,
    outputSolution,
    outputSolutionRules,
    outputEvents,
    time,
    soln,
  },
  
  (*{time, soln} = AbsoluteTiming[Apply[parameterizedSolution, simulationParameters]];*)
  (*Echo[time];*)
  {outputSolution, outputEvents} = Reap[
    Apply[parameterizedSolution, simulationParameters],
    {"containment","herd","icu","hospital","cutoff"},
    List
  ];

  outputSolution = Association[
    MapThread[#1->#2&,{outputODE,outputSolution}]];

  outputSolution = Join[
    outputSolution,
    <|
      Sq->(Sum[outputSolution[s][#],{s,Cases[outputODE,sSq[_]]}]&),
      Iq->(outputSolution[ISq][#]+outputSolution[IHq][#]+outputSolution[ICq][#]&),
      Rq->(outputSolution[RSq][#]+outputSolution[RHq][#]+outputSolution[RCq][#]&)
     |>
  ];

  outputEvents = Association[Table[
      event[[1]]-><|
        "eventName"->event[[1]],
        "day"->event[[2,1,1]],
        "thresholdCrossed"->event[[2,1,2]]|>,
      {event,Flatten[outputEvents,1]}]];

  {outputSolution, outputEvents}
];


endTime[ifun_]:=Part[ifun["Domain"],1,-1];

(* Given a set fit parameters, simulated parameters and a definition of a scenario,
run all the simulations and produce the quantiles for the mean and confidence band estimates *)
evaluateScenario[state_, fitParams_, standardErrors_, stateParams_, scenario_, numberOfSimulations_:100]:=Module[{
    aug1,
    simDeciles,
    simMedian,
    containmentTime,
    CumulativeCriticalQuantiles,
    CumulativeHospitalizedQuantiles,
    CumulativeInfectionQuantiles,
    CumulativeRecoveredQuantiles,
    CurrentlyCriticalQuantiles,
    CurrentlyHospitalizedQuantiles,
    CurrentlyInfectedQuantiles,
    CurrentlyInfectiousQuantiles,
    DeathQuantiles,
    deciles,
    distancing,
    endOfEval,
    endOfEvalAug1,
    endOfYear,
    events,
    hasContainment,
    hasHospitalOverload,
    hasIcuOverload,
    herdTime,
    hospitalOverloadTime,
    icuOverloadTime,
    paramExpected,
    percentileMap,
    PCRQuantiles,
    percentPositiveCase,
    population,
    rawSimResults,
    RecoveredCriticalQuantiles,
    RecoveredHospitalizedQuantiles,
    setDistancing,
    sim,
    simResults,
    sims,
    sol,
    solutionRules,
    summary,
    summaryAug1,
    SuseptibleQuantiles,
    testSim,
    timeSeriesData,
    rawSimTime,
    modelComponents,
    outputODE,
    parameterizedSolution
  },

  paramExpected = {
    fitParams["r0natural"],
    daysUntilNotInfectious0,
    daysUntilHospitalized0,
    daysFromInfectedToInfectious0,
    daysToLeaveHosptialNonCritical0,
    stateParams["params"]["pPCRNH"],
    stateParams["params"]["pPCRH"],
    daysTogoToCriticalCare0,
    daysFromCriticalToRecoveredOrDeceased0,
    stateParams["params"]["fractionOfCriticalDeceased"],
    fitParams["importtime"],
    importlength0,
    stateParams["params"]["initialInfectionImpulse"],
    tmax0,
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"],
    fitParams["stateAdjustmentForTestingDifferences"],
    fitParams["distpow"]
  };

  {sol, events} = integrateModel[state, scenario["id"], paramExpected];

  aug1 = 214;
  endOfYear = 730;
  endOfEval = endOfYear;
  endOfEvalAug1 = aug1;
   population = stateParams["params"]["population"];

  Echo["Generating simulations for " <>state<> " in the " scenario["name"] <> " scenario"];
  sims=generateSimulations[numberOfSimulations,fitParams,standardErrors,endOfEval,stateParams];

  (* generate a solution for each simulation so we can get bands *)
  modelComponents = simModelPrecompute[state][scenario["id"]];
  
  outputODE = modelComponents["outputODE"];
  parameterizedSolution = modelComponents["parameterizedSolution"];

  rawSimResults=Map[integrateModelSim[parameterizedSolution, outputODE, #][[1]]&, sims];
  simResults=Select[rawSimResults, endTime[#[Sq]]>=endOfEval&];
 

  deciles = Range[0,10]/10;

  simDeciles[computationFunction_,simResults_:simResults]:=Quantile[Map[computationFunction, simResults], deciles];
  simMedian[computationFunction_,simResults_:simResults]:=Median[Map[computationFunction, simResults]];

  PCRQuantiles[t_] := simDeciles[#[PCR][t]&] * population;
  DeathQuantiles[t_] := simDeciles[#[Deaq][t]&] * population;
  CurrentlyInfectedQuantiles[t_] := simDeciles[#[Eq][t]&] * population;
  CurrentlyInfectiousQuantiles[t_] := simDeciles[#[Iq][t]&] * population;
  CumulativeHospitalizedQuantiles[t_] := simDeciles[#[RepHq][t]&] * population;
  CumulativeCriticalQuantiles[t_] := simDeciles[#[RepHCq][t]&] * population;
  (* TODO why does this not include people who are exposed or infectious? *)
  (* it looks like this used later on to mock up the number of people who are symptomatic; we cannot compute this quantity with the current model *)
  CumulativeInfectionQuantiles[t_] := simDeciles[#[Deaq][t] + #[Rq][t]&] * population;
  CumulativeRecoveredQuantiles[t_] := simDeciles[#[Rq][t]&] * population;
  RecoveredHospitalizedQuantiles[t_] := simDeciles[#[RHq][t]&] * population;
  RecoveredCriticalQuantiles[t_] := simDeciles[#[RCq][t]&] * population;
  CurrentlyHospitalizedQuantiles[t_] := simDeciles[(*stateParams["params"]["pPCRH"]**)#[HHq][t]&] * population;
  CurrentlyCriticalQuantiles[t_] := simDeciles[(*stateParams["params"]["pPCRH"]**)#[CCq][t]&] * population;
  SuseptibleQuantiles[t_] :=  simDeciles[#[Sq][t]&] * population;
  
  percentileMap[percentileList_]:=Association[MapIndexed[("percentile" <> ToString[10(First[#2]-1)]) -> #1&, percentileList]];
  
  distancing = stateDistancingPrecompute[state][scenario["id"]]["distancingFunction"];

  (* TODO Revisit these defintions *)
  (* TODO shift all percentiles down by 1 (since index 1 is now the zeroth percentile) *)
  timeSeriesData = Module[{},
    Table[Association[{
          "day"->t,
          "distancing"->distancing[t]^fitParams["distpow"],
          "hospitalCapacity"->(1-stateParams["params"]["bedUtilization"]*If[distancing[t]>0.3,(1-0.5)/(1-0.3)*(distancing[t]-.3)+1,1])*stateParams["params"]["staffedBeds"],
          "dailyPcr" -> Merge[{
              <|"expected"-> population*(sol[PCR][t] - sol[PCR][t-1])|>,
              percentileMap[PCRQuantiles[t] - PCRQuantiles[t-1]]
            },First],
          "dailyTestsRequiredForContainment" -> <|"expected"-> population*testToAllCaseRatio0*(sol[cumEq][t])|>,
          "cumulativePcr" -> Merge[{
              <|"confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["positive"]]|>,
              <|"expected"-> population*sol[PCR][t]|>,
              percentileMap[PCRQuantiles[t]]
            },First],
          "cumulativeExposed"->Merge[{
            <|"expected"-> population*sol[cumEq][t]|>
          },First],
          "cumulativeDeaths" -> Merge[{
              <|"confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, If[KeyExistsQ[Select[stateParams["thisStateData"],(#["day"]==t)&][[1]],"death"],Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["death"],0]]|>,
              <|"expected"-> population*sol[Deaq][t]|>,
              percentileMap[DeathQuantiles[t]]
            },First],
          "currentlyInfected" -> Merge[{
              <|"expected"-> population*sol[Eq][t]|>,
              percentileMap[CurrentlyInfectedQuantiles[t]]
            }, First],
          "currentlyInfectious" -> Merge[{
              <|"expected"-> population*sol[Iq][t]|>,
              percentileMap[CurrentlyInfectiousQuantiles[t]]
            }, First],
          "cumulativeRecoveries" -> Merge[{
              <|"expected"-> population*sol[Rq][t]|>,
              percentileMap[CumulativeRecoveredQuantiles[t]]
            }, First],
            
          "currentlyReportedHospitalized" -> Merge[{
              <|"confirmed"->If[
                  Length[Select[stateParams["hospitalizationCurrentData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["hospitalizationCurrentData"],
                      (#["day"]==t)&][[1]],"hospitalizations"],
                  Select[stateParams["hospitalizationCurrentData"],(#["day"]==t)&][[1]]["hospitalizations"],
                  0
              ]|>,
              <|"expected"-> (*stateParams["params"]["pPCRH"]**)population*sol[HHq][t - daysForHospitalsToReportCases0]|>,
              percentileMap[CurrentlyHospitalizedQuantiles[t - daysForHospitalsToReportCases0]]
            },First],
          "currentlyHospitalized" -> Merge[{
              <|"expected"-> population*sol[HHq][t]|>,
              percentileMap[CurrentlyHospitalizedQuantiles[t]]
            }, First],
          "cumulativeReportedHospitalized" -> Merge[{
              <|"confirmed"->If[
                  Length[Select[stateParams["hospitalizationCumulativeData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["hospitalizationCumulativeData"],
                      (#["day"]==t)&][[1]],"hospitalizations"],
                  Select[stateParams["hospitalizationCumulativeData"],(#["day"]==t)&][[1]]["hospitalizations"],
                  0
              ]|>,
              <|"expected"-> population*sol[RepHq][t - daysForHospitalsToReportCases0]|>,
              percentileMap[CumulativeHospitalizedQuantiles[t - daysForHospitalsToReportCases0]]
            },First],
          "cumulativeHospitalized" -> Merge[{
              <|"expected"-> population*sol[EHq][t]|>,
              percentileMap[CumulativeHospitalizedQuantiles[t]]
            }, First],
            
          "cumulativeCritical" -> Merge[{
              <|"confirmed"->If[
                  Length[Select[stateParams["icuCumulativeData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["icuCumulativeData"],
                      (#["day"]==t)&][[1]],"icu"],
                  Select[stateParams["icuCumulativeData"],(#["day"]==t)&][[1]]["icu"],
                  0
              ]|>,
              <|"expected"-> population*(sol[RepHCq][t - daysForHospitalsToReportCases0])|>,
              percentileMap[CumulativeCriticalQuantiles[t]]
            }, First],
          "currentlyCritical" -> Merge[{
              <|"confirmed"->If[
                  Length[Select[stateParams["icuCurrentData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["icuCurrentData"],
                      (#["day"]==t)&][[1]],"icu"],
                  Select[stateParams["icuCurrentData"],(#["day"]==t)&][[1]]["icu"],
                  0
              ]|>,
              <|"expected"-> (*stateParams["params"]["pPCRH"]**)population*sol[CCq][t - daysForHospitalsToReportCases0]|>,
              percentileMap[CurrentlyCriticalQuantiles[t]]
            },First],
          "susceptible" -> Merge[{
              <|"expected"-> population*sol[Sq][t]|>,
              percentileMap[SuseptibleQuantiles[t]]
            },First]
      }],{t,Floor[fitParams["importtime"]] - 5, endOfEval}]];

  hasContainment = KeyExistsQ[events, "containment"];
  hasHospitalOverload = KeyExistsQ[events, "hospital"];
  hasIcuOverload = KeyExistsQ[events, "icu"];

  containmentTime = If[hasContainment,events["containment"]["day"]];
  hospitalOverloadTime = If[hasHospitalOverload,events["hospital"]["day"]];
  icuOverloadTime = If[hasIcuOverload,events["icu"]["day"]];

  {summary, summaryAug1} = Map[
    Function[t, <|
       "totalProjectedDeaths"->sol[Deaq][t] * population,
"totalProjectedPCRConfirmed"-> sol[PCR][t] * population,
"totalProjectedInfected"->  sol[cumEq][t] * population,
"totalInfectedFraction"-> sol[cumEq][t],
"fatalityRate"-> sol[Deaq][t] /  sol[cumEq][t],
"fatalityRateSymptomatic"-> sol[Deaq][t] / (fractionSymptomatic0 * sol[cumEq][t]),
"fatalityRatePCR"-> sol[Deaq][t] / sol[PCR][t],
"fractionOfSymptomaticHospitalized"-> sol[EHq][t] / (fractionSymptomatic0 * sol[cumEq][t]),
"fractionOfPCRHospitalized"-> sol[RepHq][t] / sol[PCR][t],
"fractionHospitalizedInICU"->(sol[EHCq][t]) / (sol[EHq][t] + sol[EHCq][t]),
"fractionDeathOfHospitalized"->(sol[Deaq][t] / (sol[RepHq][t] + sol[RepHCq][t])),
"fractionOfInfectionsPCRConfirmed"-> sol[PCR][t] / (sol[cumEq][t]),
"dateContained"->DateString[DatePlus[{2020,1,1},Select[{#["day"], #["dailyPcr"]["expected"]/population}&/@timeSeriesData,#[[1]]>today&&#[[2]]<2/1000000&][[1]][[1]]-1]],
"dateICUOverCapacity"->If[!TrueQ[icuOverloadTime == Null],
    DateString[DatePlus[{2020,1,1},icuOverloadTime-1]],
    ""],
"dateHospitalsOverCapacity"->If[!TrueQ[hospitalOverloadTime == Null],
    DateString[DatePlus[{2020,1,1}, hospitalOverloadTime - 1]],
    ""]|>],
    {
      If[hasContainment,containmentTime,endOfEval],
      If[hasContainment, Min[containmentTime, endOfEvalAug1], endOfEvalAug1]}
 ];
 
 Merge[{
      <|"distancingLevel"-> stateDistancingPrecompute[state][scenario["id"]]["distancingLevel"]|>,
      scenario,
      Association[{
          "timeSeriesData"->timeSeriesData,
          "events"->events,
          "summary"->summary,
          "summaryAug1"->summaryAug1
    }]}, First]
];



(* evaluate state for all scenarios *)
(* we first fit the data on PCR and fatalities to find the R0 and importtime for that state
then we generate a set of all the simulated parameters. Finally we call evaluateScenario to run and aggregate the
simulation results for each scenario *)
Clear[equationsODE,eventsODE,initialConditions,outputODE,dependentVariablesODE,parameters,DeaqParametric,PCRParametric];
evaluateState[state_, numberOfSimulations_:100]:= Module[{
    (*distancing,*)
    modelComponents,
    params,
    percentPositiveCase,
    longData,
    thisStateData,
    logTransform,
    model,
    fit,
    fitParams,
    icuCapacity,
    dataWeights,
    standardErrors,
    hospitalizationCurrentData,
    icuCurrentData,
    hospitalizationCumulativeData,
    icuCumulativeData,
    hospitalCapacity,
    gofMetrics,
    equationsODE,
    eventsODE,
    initialConditions,
    outputODE,
    dependentVariablesODE,
    parameters,
    DeaqParametric,
    PCRParametric,
    rlower,
    rupper,
    tlower,
    tupper,
    replower,
    repupper,
    deathDataLength,
    output,
    paramExpected,
    fittime
  },

  modelComponents = modelPrecompute[state]["scenario3"];

  percentPositiveCase[t_]:=posInterpMap[state][t];

  params=stateParams[state];
  icuCapacity=params["icuBeds"]/params["population"];
  hospitalCapacity=(1-params["bedUtilization"])*params["staffedBeds"]/params["population"];
  hospitalizationCurrentData = stateHospitalizationCurrentActualsData[state];
  hospitalizationCumulativeData = stateHospitalizationCumulativeActualsData[state];
  icuCurrentData = stateICUCurrentActualsData[state];
  icuCumulativeData = stateICUCumulativeActualsData[state];


  logTransform = Thread[{r0natural,importtime,stateAdjustmentForTestingDifferences,distpow}->Exp[{logR0Natural,logImportTime,logStateAdjustmentForTestingDifferences,logDistpow}]];
  equationsODE = modelComponents["equationsODE"]/.modelComponents["replaceKnownParameters"][state]/.logTransform;
  eventsODE = modelComponents["parametricFitEvents"]/.modelComponents["replaceKnownParameters"][state]/.logTransform;
  initialConditions = modelComponents["initialConditions"];
  dependentVariablesODE = modelComponents["dependentVariables"];
  parameters = {logR0Natural, logImportTime, logStateAdjustmentForTestingDifferences, logDistpow};

  outputODE = {Deaq, PCR};
  {DeaqParametric,PCRParametric}= {Deaq, PCR}/.ParametricNDSolve[
    {equationsODE, eventsODE, initialConditions},
    outputODE,
    {t,tmin0,tmax0},
    parameters,
    DependentVariables->dependentVariablesODE,
    Method->{"DiscontinuityProcessing"->False}
  ];

  {rlower, rupper, tlower, tupper, replower, repupper}=getBounds[state];

  thisStateData=Select[parsedData,(#["state"]==state&&#["positive"]>50)&];

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
        Log[3.8]<=distpow<= Log[4],
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


  paramExpected = <|
    "r0"-> <|"value"-> fitParams["r0natural"], "name"->"Basic reproduction number", "description"-> "The basic reproduction number.", "type"->"fit"|>,
    "daysUntilNotInfectious"-><|"value"-> daysUntilNotInfectious0, "name"-> "Days until not infectious", "description"-> "The number of days it takes to lose infectiousness after starting on average.", "type"->"literature"|>,
    "daysUntilHospitalized"-><|"value"-> daysUntilHospitalized0, "name"-> "Days until hospitalized", "description"-> "The number of days it takes to become hospitalized, if you are going to, after becoming infectious on average.", "type"->"literature"|>,
    "daysFromInfectedToInfectious"-><|"value"-> daysFromInfectedToInfectious0, "name"-> "Days from infected to infectious", "description"-> "The number of days it takes to become infectious after being infected on average", "type"->"literature"|>,
    "daysToLeaveHosptialNonCritical"-><|"value"-> daysToLeaveHosptialNonCritical0, "name"-> "Days to leave the hospital in a non-critical case", "description"-> "The number of days it takes to leave the hospital if you are not a critical case", "type"->"literature"|>,
    "pPCRNH"-><|"value"-> params["pPCRNH"], "name"-> "Probability of getting a positive PCR test if you are not in the hospital", "description"-> "An age-adjusted probability that you get a positive PCR test if your disease is not serious enough to require hospitalization or critical care.", "type"->"literature"|>,
    "pPCRH"-><|"value"-> params["pPCRH"], "name"-> "Probability of getting a positive PCR test if you are in the hospital or ICU,", "description"-> "An age-adjusted probability that you get a positive PCR test in cases that require hospitalization or critical care", "type"->"literature"|>,
    "daysTogoToCriticalCare"-><|"value"-> daysTogoToCriticalCare0, "name"-> "Days to go to critical care after arriving in the hospital", "description"-> "The number of days it takes to go to critical care after arriving in the hospital in a serious case.", "type"->"literature"|>,
    "daysFromCriticalToRecoveredOrDeceased"-><|"value"-> daysFromCriticalToRecoveredOrDeceased0, "name"-> "Days from an ICU admission to recovery or fatality", "description"-> "The number of days it takes on average to resolve an ICU admission on average", "type"->"literature"|>,
    "fractionOfCriticalDeceased"-><|"value"-> params["fractionOfCriticalDeceased"], "name"-> "Fraction of ICU admissions deceased.", "description"-> "An age adjusted fraction of the ICU admissions that will be deceased.", "type"->"literature"|>,
    "importtime"-><|"value"-> fitParams["importtime"], "name"-> "Import Time", "description"-> "The day that COVID-19 was seeded into that state.", "type"->"fit"|>,
    "importlength"-><|"value"-> importlength0, "name"-> "Import duration", "description"-> "Duration of the covid seeding event -- together with the initial infection impulse gets the model kicked off starting at the import time.", "type"->"assumed"|>,
    "initialInfectionImpulse"-><|"value"-> params["initialInfectionImpulse"], "name"-> "Size of initial infection impulse", "description"-> "Size of the initial infection impulse. The model is not very sensitive to the exact value, but it is needed in order to start the virus spreading.", "type"->"assumed"|>,
    "pS"-><|"value"-> params["pS"], "name"-> "Probability of getting a mild case.", "description"-> "An age-adjusted probability that you get a mild case.", "type"->"literature"|>,
    "pH"-><|"value"-> params["pH"], "name"-> "Probability of getting a case bad enough to require hospitalization.", "description"-> "An age-adjusted probability that you get a case requiring hospitalization.", "type"->"literature"|>,
    "pC"-><|"value"-> params["pC"], "name"-> "Probability of getting a case bad enough to require ICU admission", "description"-> "An age-adjusted probability get a severe case requiring ICU admission.", "type"->"literature"|>,
    "stateAdjustmentForTestingDifferences"-><|"value"-> fitParams["stateAdjustmentForTestingDifferences"], "name"-> "State adjustment for differences in PCR / death testing and reporting.", "description"-> "A parameter fit to adjust the time difference between PCR and fatality reporting on a state by state basis", "type"->"fit"|>,
    "distancePower"-><|"value"-> fitParams["distpow"], "name"-> "Power of the distancing function", "description"-> "Social distancing effect on reducing susceptibility has a larger effect when densities are higher (eg the original R0 is higher). So we fit a power of the distancing function.", "type"->"fit"|>
  |>;

  Echo[gofMetrics];

  Echo[
    Column[{
        Text["Fit for "<>state],
        Row[{
            Show[
              ListLogPlot[Cases[longData,{#, t_,c_}:>{t,c}]&/@{1,2},ImageSize->500,PlotRange->{{40,200},{10^-7,10^-1}}],
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
                {t,40,200},PlotRange->{{40,200}, {10^-7,10^-1}}, ImageSize->500]
            ],
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
      "parameters"->paramExpected,
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

generateAugSummaryForState[data_, state_]:= Module[{},
  Join[{state},Values[Association[Join[
          KeyDrop[KeyDrop[KeyDrop[data["scenarios"][#],"timeSeriesData"],"events"],"summaryAug1"],
          data["scenarios"][#]["summaryAug1"]
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

exportAllStatesSummaryAug1[allStates_]:=Module[{header, rows, table},
  header = {Append[Prepend[Keys[
          Association[Join[
              KeyDrop[KeyDrop[KeyDrop[allStates[Keys[allStates][[1]]]["scenarios"]["scenario1"],"timeSeriesData"],"events"],"summaryAug1"],
              allStates[Keys[allStates][[1]]]["scenarios"]["scenario1"]["summaryAug1"]
        ]]],"state"], {"r0natural","importtime","stateAdjustmentForTestingDifferences"}]};
  rows = generateSummaryForState[allStates[#],#]&/@Keys[allStates];

  table = Flatten[Join[{header}, rows],1];

  Export["tests/summaryAug1.csv", table];
]

getSeriesForKey[data_, key_]:=Module[{},
 #[key]&/@data
];

exportTimeSeries[state_, scenario_, data_]:=Module[{timeData, fixedKeys, timeDataKeys, days, distancing, hospitalCapacity},
   fixedKeys = {"day", "distancing", "hospitalCapacity"};
   timeData = data["timeSeriesData"];
   timeDataKeys = Keys[KeyDrop[timeData[[1]], fixedKeys]];
   
   
   distancing = #["distancing"]&/@data["timeSeriesData"];
   hospitalCapacity = #["hospitalCapacity"]&/@data["timeSeriesData"];
   
   Export["public/json/"<>state<>"/"<>scenario["id"]<>"/"<>#<>".json", getSeriesForKey[data["timeSeriesData"], #]]&/@timeDataKeys;
   
   Export["public/json/"<>state<>"/"<>scenario["id"]<>"/distancing.json", distancing];
   Export["public/json/"<>state<>"/"<>scenario["id"]<>"/hospitalCapacity.json", hospitalCapacity];
];

(* the main utility for generating fits / simulations for each state. pass a simulation count to the first
argument and an array of two letter state code strings to the second *)
(* this will write JSON out to the respective state files and the change can be previewd on localhost:3000
when running the web server *)
GenerateModelExport[simulationsPerCombo_:1000, states_:Keys[fitStartingOverrides]] := Module[{days},
  loopBody[state_]:=Module[{stateData},
    stateData=evaluateStateAndPrint[state, simulationsPerCombo];
    Export["public/json/"<>state<>"/"<>#["id"]<>"/meta.json", KeyDrop[stateData["scenarios"][#["id"]], {"timeSeriesData"}]]&/@scenarios;
    exportTimeSeries[state, #, stateData["scenarios"][#["id"]]]&/@scenarios;
    days = #["day"]&/@stateData["scenarios"]["scenario1"]["timeSeriesData"];
    Export["public/json/"<>state<>"/days.json", days];
    Export["public/json/"<>state<>"/summary.json",KeyDrop[stateData, {"scenarios"}]];
    stateData
  ];

  allStatesData=Association[Parallelize[Map[(#->loopBody[#])&,states]]];

  exportAllStatesSummary[allStatesData];
  exportAllStatesSummaryAug1[allStatesData];

  exportAllStatesGoodnessOfFitMetricsCsv["tests/gof-metrics.csv",allStatesData];
  exportAllStatesGoodnessOfFitMetricsSvg["tests/relative-fit-errors.svg",allStatesData];
  exportAllStatesHospitalizationGoodnessOfFitMetricsSvg["tests/hospitalization-relative-fit-errors.svg",allStatesData];
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
  <|
    "population"->pop,
    "importtime0"->countryImportTime[country],
    "ventilators"->countryVentilators[country],
    "pS"->Sum[noCare[a, medianHospitalizationAge, pCLimit,pHLimit,ageCriticalDependence,ageHospitalizedDependence ]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
    "pH"->Sum[infectedHospitalized[a]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
    "pC"->Sum[infectedCritical[a, medianHospitalizationAge, pCLimit,ageCriticalDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}]
  |>
];

(* helper to check that the parameter dists are centered *)
(*Echo[(Mean[#]&/@Transpose[sims] - paramExpected)//N];*)





fitManipulate[state_:"OH"] := Module[{params, distancing, modelComponents, logTransform, equationsODE, eventsODE, initialConditions, dependentVariablesODE, parameters,
outputODE, thisStateData, hospitalizationCumulativeData, icuCumulativeData, longData, DeaqParametric, PCRParametric, RepHqParametric, RepHCqParametric},
params=stateParams[state];
distancing = stateDistancingPrecompute[state]["scenario1"]["distancingFunction"];
modelComponents = generateModelComponents[distancing];
logTransform = Thread[{r0natural,importtime,stateAdjustmentForTestingDifferences,distpow}->Exp[{logR0Natural,logImportTime,logStateAdjustmentForTestingDifferences,logDistpow}]];
  equationsODE = modelComponents["equationsODE"]/.modelComponents["replaceKnownParameters"][state]/.logTransform;
  eventsODE = modelComponents["parametricFitEvents"]/.logTransform;
  initialConditions = modelComponents["initialConditions"];
  dependentVariablesODE = modelComponents["dependentVariables"];
  parameters = {logR0Natural, logImportTime, logStateAdjustmentForTestingDifferences, logDistpow};

  outputODE = {Deaq, PCR, RepHq};
  {DeaqParametric,PCRParametric,  RepHqParametric}= {Deaq, PCR, RepHq}/.ParametricNDSolve[
    {equationsODE, eventsODE, initialConditions},
    outputODE,
    {t,tmin0,tmax0},
    parameters,
    DependentVariables->dependentVariablesODE,
    Method->{"DiscontinuityProcessing"->False}
  ];

thisStateData=Select[parsedData,(#["state"]==state&&#["positive"]>0)&];
hospitalizationCumulativeData = stateHospitalizationCumulativeActualsData[state];
  icuCumulativeData = stateICUCumulativeActualsData[state];

longData=Select[Join[
{1,#["day"],If[TrueQ[#["death"]==Null],0,(#["death"]/params["population"])//N]}&/@thisStateData,
{2,#["day"],(#["positive"]/params["population"])//N}&/@thisStateData,
{3,#["day"],#["hospitalizations"]/params["population"]}&/@hospitalizationCumulativeData],#[[3]]>0&]
;

Manipulate[Show[
   ListLogPlot[Cases[longData,{#,t_,c_}:>{t,c}]&/@{1,2,3},ImageSize->500,PlotRange->{{40,150},{0,Automatic}}],
   LogPlot[{
      DeaqParametric[Log[r0],Log[t0],Log[adj],Log[distpow]][t],
      PCRParametric[Log[r0],Log[t0],Log[adj],Log[distpow]][t],
      RepHqParametric[Log[r0],Log[t0],Log[adj],Log[distpow]][t-daysForHospitalsToReportCases]
   },{t,40,150},ImageSize->500]
 ],{{r0,3.645},2,5},{{t0,65},35,70},{{adj,0.38},0,2},{{distpow,2},1.5,2},{{daysForHospitalsToReportCases,1.5},1,10}]
];


fitManipulateCurrent[state_:"TX"] := Module[
  {params, distancing, modelComponents, logTransform, equationsODE, eventsODE, initialConditions, dependentVariablesODE, parameters,
outputODE, thisStateData, hospitalizationCurrentData, icuCumulativeData, HHqParametric, longData, DeaqParametric, PCRParametric, RepHqParametric, RepHCqParametric},
params=stateParams[state];
distancing = stateDistancingPrecompute[state]["scenario1"]["distancingFunction"];
modelComponents = generateModelComponents[distancing];
logTransform = Thread[{r0natural,importtime,stateAdjustmentForTestingDifferences,distpow}->Exp[{logR0Natural,logImportTime,logStateAdjustmentForTestingDifferences,logDistpow}]];
  equationsODE = modelComponents["equationsODE"]/.modelComponents["replaceKnownParameters"][state]/.logTransform;
  eventsODE = modelComponents["parametricFitEvents"]/.logTransform;
  initialConditions = modelComponents["initialConditions"];
  dependentVariablesODE = modelComponents["dependentVariables"];
  parameters = {logR0Natural, logImportTime, logStateAdjustmentForTestingDifferences, logDistpow};

  outputODE = {Deaq, PCR, HHq};
  {DeaqParametric,PCRParametric,  HHqParametric}= {Deaq, PCR, HHq}/.ParametricNDSolve[
    {equationsODE, eventsODE, initialConditions},
    outputODE,
    {t,tmin0,tmax0},
    parameters,
    DependentVariables->dependentVariablesODE,
    Method->{"DiscontinuityProcessing"->False}
  ];

thisStateData=Select[parsedData,(#["state"]==state&&#["positive"]>0)&];
hospitalizationCurrentData = stateHospitalizationCurrentActualsData[state];
  icuCumulativeData = stateICUCumulativeActualsData[state];

longData=Select[Join[
{1,#["day"],If[TrueQ[#["death"]==Null],0,(#["death"]/params["population"])//N]}&/@thisStateData,
{2,#["day"],(#["positive"]/params["population"])//N}&/@thisStateData,
{3,#["day"],#["hospitalizations"]/params["population"]}&/@hospitalizationCurrentData],#[[3]]>0&];

Manipulate[Show[
   ListLogPlot[Cases[longData,{#,t_,c_}:>{t,c}]&/@{1,2,3},ImageSize->500,PlotRange->{{40,150},{0,Automatic}}],
   LogPlot[{
      DeaqParametric[Log[r0],Log[t0],Log[adj],Log[distpow]][t],
      PCRParametric[Log[r0],Log[t0],Log[adj],Log[distpow]][t],
      HHqParametric[Log[r0],Log[t0],Log[adj],Log[distpow]][t-daysForHospitalsToReportCases]
   },{t,40,150},ImageSize->500]
 ],{{r0,3.645},2,5},{{t0,65},35,70},{{adj,0.38},0,2},{{distpow,2},1.5,2},{{daysForHospitalsToReportCases,1.5},1,10}]
];
