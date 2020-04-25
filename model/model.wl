(* ::Package:: *)

(** Model parameters. See https://docs.google.com/spreadsheets/d/1DH58EFf_YkWHa_zn8-onBGzsYFMamjSjOItr137vu9g/edit#gid=0 **)
SetDirectory[$UserDocumentsDirectory<>"/Github/covidmodel"];

(* In mathematica imported code is executed *)
(* these load some data from various sources, and generate helper functions for evaluating statistics and generating plots *)
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
daysToLeaveHosptialNonCritical0 = 8;

(*Rate of leaving hospital and going to critical care*)
daysTogoToCriticalCare0 = 1.5;

(*Rate of leaving critical care, weeks*)
daysFromCriticalToRecoveredOrDeceased0 = 8.5;

(* probabilities of getting pcr confirmations given hospitalized / non-hospitalized resp *)
pPCRH0 = 0.8;
pPCRNH0 = 0.15;

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
fractionOfHospitalizedNonCriticalDeceased0 = 0.07;

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

(* convergence function for differences in state testing *)
(* we allow the model to fit a multiplicative difference of the rate of change of the tests *)
(* but after some time we expect states to converge on a common value *)
(* that common value statesConvergeToValue is chosen to target an overall percent of infections confirmed beteween 28 and 34% *)
(* see fractionOfInfectionsPCRConfirmed in the summary *)
statesConvergeToValue=1.7;
convergenceMidpoint=100+30; (*30 days from now *)
convergencePeriod=60; (* 90% 2 months from now *)
convergenceFunction[stateRate_,t_]:=stateRate+(statesConvergeToValue-stateRate)LogisticSigmoid[(t-convergenceMidpoint)*5.88888/convergencePeriod];

(* not used in model only for output *)
testToAllCaseRatio0=100;

(* threshold used to indicate where test and trace becomes feasible *)
testTraceNewCaseThreshold0=2*10^-6;
(* delay between newly exposed crossing the threshold and activating the test / trace *)
testTraceExposedDelay0=10;

(* Fraction of symptomatic cases *)
fractionSymptomatic0 = 0.7;

(* Set heterogeneous susceptibility using lognormal function with bins of constant population size *)
(* this causes a smaller overall fraction of the population to get infected in scenarios where the epidemic is uncontained *)
(* the nubmer of bins is just to give a relatively good approximation to the susceptibility distribution we use *)
(* the standard deviation is chosen so that the final infected fraction ends up at roughly 70% in uncontained scenarios *)
susceptibilityBins=10;
susceptibilityStdev0=1.2;
susceptibilityValuesLogNormal[binCount_,stdDev_]:=Module[{m,s,dist,binEdges},
  m=-stdDev^2/2;
  s=Sqrt[Log[stdDev^2+1]];
  dist=LogNormalDistribution[m,s];
  binEdges=InverseCDF[dist,Range[0,binCount]/binCount];
  Table[
    NIntegrate[x PDF[dist,x],{x,binEdges[[i]],binEdges[[i+1]]}],{i,1,binCount}]//(binCount #/Total[#])&
];
susceptibilityValues=susceptibilityValuesLogNormal[susceptibilityBins,susceptibilityStdev0];
susceptibilityInitialPopulations=ConstantArray[1/susceptibilityBins,susceptibilityBins];


(* for convenience we pre-compute the most recent day of distancing data to be rendered on the front end *)
mostRecentDistancingDay = usStateDistancingPrecompute["CA"]["scenario1"]["mostRecentDistancingDay"];


(* to help the numerical optimizer we give slightly different problem bounds depening on state
based on eg their epidemics starting earlier or having different hospital systems and thus a different
gap between PCR and death *)
(* In the future a proposal for how to fix this is to run a meta fit varying the bounds around reasonable ranges
and starting with a different random seed, then pick the best one (the real one that didnt get stuck hopefully) *)
fitStartingOverrides=<|
  "AZ"-><|"rlower"->3,"rupper"->5,"tlower"->35,"tupper"->75,"replower"->0.5,"repupper"->0.8,"powlower"->1.8,"powupper"->2.5|>,
  "CA"-><|"rlower"->3.1,"rupper"->4.5,"tlower"->35,"tupper"->55,"replower"->0.55,"repupper"->0.7,"powlower"->1.5,"powupper"->2|>,
  "FL"-><|"rlower"->3.6,"rupper"->4.2,"tlower"->38,"tupper"->75,"replower"->0.9,"repupper"->1.2,"powlower"->1.8,"powupper"->2|>,
  "PA"-><|"rlower"->4.8,"rupper"->5,"tlower"->45,"tupper"->75,"replower"->0.8,"repupper"->1.1,"powlower"->1.8,"powupper"->2|>,
  "CO"-><|"rlower"->3.3,"rupper"->5,"tlower"->42.5,"tupper"->75,"replower"->0.6,"repupper"->0.7,"powlower"->1.8,"powupper"->2.5|>,
  "TX"-><|"rlower"->3,"rupper"->5,"tlower"->42,"tupper"->75,"replower"->0.5,"repupper"->0.75,"powlower"->1.8,"powupper"->2.5|>,
  "WA"-><|"rlower"->2,"rupper"->3.5,"tlower"->10,"tupper"->15,"replower"->0.75,"repupper"->0.95,"powlower"->1.5,"powupper"->2|>,
  "CT"-><|"rlower"->4.7,"rupper"->5,"tlower"->47,"tupper"->53,"replower"->0.3,"repupper"->0.8,"powlower"->1.8,"powupper"->2|>,
  "OH"-><|"rlower"->3.5,"rupper"->4.5,"tlower"->40,"tupper"->51,"replower"->0.45,"repupper"->0.6,"powlower"->1.6,"powupper"->2|>,
  "NY"-><|"rlower"->4.7,"rupper"->5,"tlower"->30,"tupper"->45,"replower"->0.4,"repupper"->0.7,"powlower"->1.5,"powupper"->2|>,
  "VA"-><|"rlower"->3.4,"rupper"->4.2,"tlower"->35,"tupper"->75,"replower"->0.65,"repupper"->0.75,"powlower"->1.5,"powupper"->2|>,
  "VT"-><|"rlower"->3,"rupper"->4.5,"tlower"->35,"tupper"->75,"replower"->0.7,"repupper"->0.85,"powlower"->1.8,"powupper"->2|>,
  "LA"-><|"rlower"->4.1,"rupper"->4.5,"tlower"->41.5,"tupper"->75,"replower"->0.4,"repupper"->0.5,"powlower"->1.9,"powupper"->2.5|>,
  "MI"-><|"rlower"->3.5,"rupper"->5,"tlower"->35,"tupper"->45,"replower"->0.35,"repupper"->0.45,"powlower"->1.5,"powupper"->2|>,
  "MS"-><|"rlower"->2.7,"rupper"->5,"tlower"->35,"tupper"->75,"replower"->0.6,"repupper"->0.75,"powlower"->1.5,"powupper"->2|>,
  "MA"-><| "rlower"->4.1,"rupper"->4.2,"tlower"->44,"tupper"-> 50,"replower"->0.55,"repupper"->0.6,"powlower"->1,"powupper"->1.5|>,
  "MD"-><|"rlower"->4.8,"rupper"->5,"tlower"->48,"tupper"->75,"replower"->0.5,"repupper"->0.6,"powlower"->1.5,"powupper"->2|>,
  "GA"-><|"rlower"->3.3,"rupper"->4,"tlower"->47,"tupper"->75,"replower"->0.40,"repupper"->0.6,"powlower"->1.9,"powupper"->2.3|>,
  "NJ"-><|"rlower"->4.8,"rupper"->5,"tlower"->40,"tupper"->48,"replower"->0.4,"repupper"->0.6,"powlower"->1.5,"powupper"->2|>,
  "IL"-><|"rlower"->4.6,"rupper"->5,"tlower"->35,"tupper"->75,"replower"->0.55,"repupper"->0.65,"powlower"->1.8,"powupper"->2|>,
  "IN"-><|"rlower"->4.1,"rupper"->5,"tlower"->35,"tupper"->60,"replower"->0.35,"repupper"->0.5,"powlower"->1.9,"powupper"->2|>,
  "OK"-><|"rlower"->3.5,"rupper"->4.5,"tlower"->35,"tupper"->75,"replower"->0.2,"repupper"->0.4,"powlower"->1.9,"powupper"->2.5|>,
  "WI"-><|"rlower"->3.4,"rupper"->4.3,"tlower"->35,"tupper"->75,"replower"->0.55,"repupper"->0.7,"powlower"->1.9,"powupper"->2.5|>,
  "NV"-><|"rlower"->3.6,"rupper"->4.3,"tlower"->48,"tupper"->75,"replower"->0.6,"repupper"->0.7,"powlower"->1.6,"powupper"->2|>,
  "OR"-><|"rlower"->2.8,"rupper"->4,"tlower"->35,"tupper"->55,"replower"->0.85,"repupper"->1.1,"powlower"->1.8,"powupper"->2|>,
  "SC"-><|"rlower"->2.8,"rupper"->4.6,"tlower"->35,"tupper"->75,"replower"->0.7,"repupper"->0.8,"powlower"->1.7,"powupper"->2.5|>(*,
  "Spain"-><|"rlower"\[Rule]4,"rupper"\[Rule]5,"tlower"\[Rule]20,"tupper"->75,"replower"->0.3,"repupper"\[Rule]0.35,"powlower"->1,"powupper"\[Rule]1.25|>,
  "France"-><|"rlower"->2.8,"rupper"->4.6,"tlower"\[Rule]25,"tupper"->75,"replower"->0.2,"repupper"->0.7,"powlower"->1,"powupper"->2.5|>,
  "Italy"-><|"rlower"\[Rule]3.5,"rupper"\[Rule]5,"tlower"\[Rule]10,"tupper"\[Rule]15,"replower"->0.2,"repupper"->0.4,"powlower"->1,"powupper"\[Rule]1.25|>*)
|>;

(* A helper to extract the bounds specified above for the fitting algorithm *)
getBounds[state_]:=Module[{},
  If[MemberQ[Keys[fitStartingOverrides],state],
    {
      fitStartingOverrides[state]["rlower"],
      fitStartingOverrides[state]["rupper"],
      fitStartingOverrides[state]["tlower"],
      fitStartingOverrides[state]["tupper"],
      fitStartingOverrides[state]["replower"],
      fitStartingOverrides[state]["repupper"],
      fitStartingOverrides[state]["powlower"],
      fitStartingOverrides[state]["powupper"]
    },
    {2.5,5,35,75,0.1,2,1,2}]
];

(* define some helper distributions and set up all the parameters that need to be simulated *)
BetaMeanSig[mu_,sig_]:=BetaDistribution[(mu^2-mu^3-mu sig)/sig,((-1+mu) (-mu+mu^2+sig))/sig];
PosNormal[mu_,sig_]:=TruncatedDistribution[{0,\[Infinity]},NormalDistribution[mu,sig]]

(* a function to generate the monte carlo simulations from combo of fit / assumed parameters *)
(* for the assumed parameters we temporarily have a 5% stdev, but we will replace this with a calculated
one when we have multiple literature sources *)
(* we mostly use normal distributions of those variables, truncated to keep them positive (physical constraint) *)
(* we also use a beta distribution for fractional parameters because that bounds them between zero and 1, and is generally used to represent distributions of fractional quantities *)
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
    importlength0,
    stateParams["params"]["initialInfectionImpulse"],
    cutoff,
    stateParams["params"]["pS"],
    stateParams["params"]["pH"],
    stateParams["params"]["pC"],
    stateParams["icuCapacity"],
    stateParams["hospitalCapacity"],
    RandomVariate[PosNormal[fitParams["stateAdjustmentForTestingDifferences"], 0.05*fitParams["stateAdjustmentForTestingDifferences"]]],
    RandomVariate[PosNormal[fitParams["distpow"], 0.05*fitParams["distpow"]]],
    0
  }&/@Range[numberOfSimulations]]



(* Assumption here is that age dependence follows a logistic curve -- zero year olds dont require any care, 
100 year olds require significant case, midpoint is the medianHospitalization age *)
infectedCritical[a_] :=
pCritical80YearOld0(1+E^((-80+medianHospitalizationAge0)/ageCriticalDependence0)) 1/(1+Exp[-((a-medianHospitalizationAge0)/ageCriticalDependence0)]);
infectedHospitalized[a_] :=
pHospitalized80YearOld0(1+E^((-80+medianHospitalizationAge0)/ageHospitalizedDependence0)) 1/(1+Exp[-((a-medianHospitalizationAge0)/ageHospitalizedDependence0)]);
noCare[a_] :=
1-infectedCritical[a]-infectedHospitalized[a];

(* test for the overall fraction that end up in the ICU out of all hospitalized *)
(*1/Sum[stateParams[state]["population"],{state,statesWithRates}]Sum[stateParams[state]["pC"]/(stateParams[state]["pH"]+stateParams[state]["pC"])*stateParams[state]["population"],{state,statesWithRates}]*)

(* fit the PCR age distribution to louisiana data *)
(* distribution from https://docs.google.com/spreadsheets/d/1N4cMGvi1y7nRJP_dvov2iaAnJlXcr2shWhHZhhI4_qA/edit#gid=1050365393 *)
(* age distribution from wolfram *)
{wid,posmid,tot,pop}={{18,12,10,10,10,10}, {9,23.5,35,45,55,65}, {123,1247,2048,2395,2737,2306}, {1112733,801901,623237,563402,625430,506630}};
proppcrage=Transpose@{posmid,tot/(wid*pop)}//N;
pcrModel=NonlinearModelFit[proppcrage,0.00048/(1+Exp[-k(x-x0)]),{k,x0},x];
pPCRNH0adj=(x/.Solve[Total[Sum[pcrModel[a]*x*100/NIntegrate[pcrModel[b],{b,0,100}]*stateRawDemographicData[#]["Distribution"][[Position[stateRawDemographicData[#]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[#]["Buckets"]}]&/@statesWithRates]/Length[statesWithRates]==pPCRNH0,x])[[1]];
pPCRH0adj=(x/.Solve[Total[Sum[pcrModel[a]*x*100/NIntegrate[pcrModel[b],{b,0,100}]*stateRawDemographicData[#]["Distribution"][[Position[stateRawDemographicData[#]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[#]["Buckets"]}]&/@statesWithRates]/Length[statesWithRates]==pPCRH0,x])[[1]];

(* once we have determined the impact on age to pPCR rates we apply per state age distributions to get an age-adjusted number *)
pPCRage[a_,adj_]:=pcrModel[a]*adj*100/NIntegrate[pcrModel[b],{b,0,100}];
pPCRNH0State[state_]:=Sum[pPCRage[a,pPCRNH0adj]*stateRawDemographicData[state]["Distribution"][[Position[stateRawDemographicData[state]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[state]["Buckets"]}]
pPCRH0State[state_]:=Sum[pPCRage[a,pPCRH0adj]*stateRawDemographicData[state]["Distribution"][[Position[stateRawDemographicData[state]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[state]["Buckets"]}]

(* fit the spread of the fraction of critical deceased to the death age distribution *)
deathdist={{10,22.5,50,60,70,80,92},{0,0.001,0.005,0.014,0.027,0.043,0.104}};
deathAgeModel=NonlinearModelFit[Transpose@{deathdist[[1]],deathdist[[2]]},0.11/(1+Exp[-k(x-x0)]),{k,x0},x];
criticalDeceasedAge[a_,adj_]:=deathAgeModel[a]*adj*100/NIntegrate[deathAgeModel[b],{b,0,100}];
deceasedAdjustWeight=(x/.Solve[Total[Sum[deathAgeModel[a]*x*100/NIntegrate[deathAgeModel[b],{b,0,100}]*stateRawDemographicData[#]["Distribution"][[Position[stateRawDemographicData[#]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[#]["Buckets"]}]&/@statesWithRates]/Length[statesWithRates]==fractionOfCriticalDeceased0,x])[[1]];
criticalDeceasedState[state_]:=Sum[criticalDeceasedAge[a,deceasedAdjustWeight ]*stateRawDemographicData[state]["Distribution"][[Position[stateRawDemographicData[state]["Distribution"],a][[1]][[1]]]][[2]],{a, stateRawDemographicData[state]["Buckets"]}]

(* define state level parameters, some of which are age adjusted as per above, some of which we get from sources (like icuBeds)  *)
getStateParams[state_]:=Module[{raw,pop,dist,buckets},
  raw = stateRawDemographicData[state];
  pop = raw["Population"];
  dist = raw["Distribution"];
  buckets = raw["Buckets"];

  (*return a map of per state params to values *)
  <|
    "population"->pop,
    "ventilators"->ventilators[state],
    "icuBeds"->If[KeyExistsQ[stateICUData, state],stateICUData[state]["icuBeds"],0],
    "staffedBeds"->If[KeyExistsQ[stateICUData, state],stateICUData[state]["staffedBeds"],0],
    "bedUtilization"->If[KeyExistsQ[stateICUData, state],stateICUData[state]["bedUtilization"],0],
    "hospitalCapacity"->If[KeyExistsQ[stateICUData, state],(1-stateICUData[state]["bedUtilization"])*stateICUData[state]["staffedBeds"],0],
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


(* Define the model to be evaulated in the simulations -- all parameters are given either from the Monte-Carlo draws or evaluting the means *)
(* This defines an enriched SEIR model with extra states (e.g., hospitalized, deceased) and reporting (e.g., cumulative PCR rates) *)
(* It also fires several events for things like when the hospital / icu capacities are exceeded so that those don't have to be computed manually later *)

generateModelComponents[distancing_] := <|
  "equationsODE" -> Flatten[{
      (**** Enriched SEIR model section ****)
      (* Do not include test figures or reporting-only totals in this section *)

      (* susceptible, binned by susceptibility; the sum of all sSq[i]'s would be Sq, the full susceptible population *)
      Table[
        sSq[i]'[t]==If[testAndTrace == 1 && testAndTraceDelayCounter[t] > testTraceExposedDelay0, 1, distancing[t]^distpow * r0natural] *
        (-susceptibilityValues[[i]] * (ISq[t]/daysUntilNotInfectious + (IHq[t] + ICq[t])/daysUntilHospitalized) - est[t]) * sSq[i][t],
        {i, 1, susceptibilityBins}],

      (* Exposed *)
      Eq'[t]==If[testAndTrace == 1 && testAndTraceDelayCounter[t] > testTraceExposedDelay0, 1, distancing[t]^distpow * r0natural] *
      Sum[(susceptibilityValues[[i]] * (ISq[t]/daysUntilNotInfectious + (IHq[t] + ICq[t])/daysUntilHospitalized) + est[t]) * sSq[i][t], {i, 1, susceptibilityBins}] - Eq[t]/daysFromInfectedToInfectious,

      (*Infected who won't need hospitalization or ICU care (not necessarily PCR confirmed; age independent *)
      ISq'[t]==pS*Eq[t]/daysFromInfectedToInfectious - ISq[t]/daysUntilNotInfectious,
      (*Recovered without needing care*)
      RSq'[t]==ISq[t]/daysUntilNotInfectious,

      (*Infected and will need hospital, won't need critical care*)
      IHq'[t]==pH*Eq[t]/daysFromInfectedToInfectious - IHq[t]/daysUntilHospitalized,
      (*Going to hospital*)
      HHq'[t]==IHq[t]/daysUntilHospitalized - HHq[t]/daysToLeaveHosptialNonCritical,
      (*Recovered after hospitalization*)
      RHq'[t]==(1 - fractionOfHospitalizedNonCriticalDeceased0) * HHq[t]/daysToLeaveHosptialNonCritical,

      (*Infected, will need critical care*)
      ICq'[t]==pC*Eq[t]/daysFromInfectedToInfectious - ICq[t]/daysUntilHospitalized,
      (*Hospitalized, need critical care*)
      HCq'[t]==ICq[t]/daysUntilHospitalized - HCq[t]/daysTogoToCriticalCare,
      (*Entering critical care*)
      CCq'[t]==HCq[t]/daysTogoToCriticalCare - CCq[t]/daysFromCriticalToRecoveredOrDeceased,
      (*Leaving critical care*)
      RCq'[t]==(1 - fractionOfCriticalDeceased) * CCq[t]/daysFromCriticalToRecoveredOrDeceased,

      (* Dead *)
      Deaq'[t]==fractionOfHospitalizedNonCriticalDeceased0 * HHq[t]/daysToLeaveHosptialNonCritical + fractionOfCriticalDeceased * CCq[t]/daysFromCriticalToRecoveredOrDeceased,

      (**** Reporting section ****)
      (* Do include quantities to measure testing rates, cumulative reporting-only counts, etc. in this section *)

      (* Cumulative exposed *)
      cumEq'[t]==If[testAndTrace == 1 && testAndTraceDelayCounter[t] > testTraceExposedDelay0, 1, distancing[t]^distpow * r0natural] * Sum[(susceptibilityValues[[i]] * (ISq[t]/daysUntilNotInfectious + (IHq[t] + ICq[t])/daysUntilHospitalized) + est[t]) * sSq[i][t], {i, 1, susceptibilityBins}],
      (*Cumulative hospitalized count*)
      EHq'[t]==IHq[t] / daysUntilHospitalized,
      (*Cumulative critical count*)
      EHCq'[t]==ICq[t] / daysUntilHospitalized,

      (*Cumulative reported positive hospital cases*)
      RepHq'[t]== testingProbability[t] * pPCRH * convergenceFunction[stateAdjustmentForTestingDifferences,t] * IHq[t] / daysUntilHospitalized,
      (*Cumulative reported ICU cases*)
      RepHCq'[t]== testingProbability[t] * pPCRH * convergenceFunction[stateAdjustmentForTestingDifferences,t] * ICq[t] / daysUntilHospitalized,
      (*Cumulative PCR confirmations*)
      PCR'[t] == testingProbability[t] * pPCRNH * convergenceFunction[stateAdjustmentForTestingDifferences,t] * pS * Eq[t]/daysFromInfectedToInfectious + RepHq'[t] + RepHCq'[t],

      (* Cumulative PCR confirmed deaths (both hospitalized and ICU) *)
      RepDeaq'[t]==testingProbability[t] * Deaq'[t],
      (* Cumulative PCR confirmed ICU deaths *)
      RepDeaICUq'[t]==testingProbability[t] * fractionOfCriticalDeceased * CCq[t]/daysFromCriticalToRecoveredOrDeceased,

      (* establishment *)
      est'[t]==0,
      
      (* test and trace tracker *)
      testAndTraceDelayCounter'[t] == If[testAndTraceDelayCounter[t] > 0, 1, 0]
  }],

  (* events used in evaluting the simluations / expectation values *)
  (* some are used purely for reporting *)
  (* the events that affect cumEq'[t] set the test and trace *)
  (* events with est[t] provide the initial infection impulse *)
  "simulationEvents" -> {
    WhenEvent[RSq[t]+RSq[t]+RCq[t]>=0.7, Sow[{t,RSq[t]+RSq[t]+RCq[t]},"herd"]],
    WhenEvent[CCq[t]>=icuCapacity, Sow[{t,CCq[t]},"icu"]],(*ICU Capacity overshot*)
    WhenEvent[HHq[t]>=hospitalCapacity, Sow[{t,HHq[t]},"hospital"]],(*Hospitals Capacity overshot*)
    WhenEvent[t>=importtime, est[t]->Exp[-initialInfectionImpulse]],
    WhenEvent[t>importtime+importlength, est[t]->0],
    WhenEvent[
      cumEq'[t] - testTraceNewCaseThreshold0 == 0 && t > today && testAndTrace == 1 && RSq[t]+RSq[t]+RCq[t]<=0.5,
      {testAndTraceDelayCounter[t]->1, "RemoveEvent"},
      DetectionMethod->"Sign", LocationMethod->"StepEnd", IntegrateEvent->False]
  },

  (* for the fitting the only event that we use is the initial infection impulse *)
  "parametricFitEvents" -> {
    WhenEvent[t>=importtime, est[t]->Exp[-initialInfectionImpulse]],
    WhenEvent[t>importtime+importlength0, est[t]->0]
  },

  "initialConditions" -> Flatten[{
      Table[sSq[i][tmin0]==susceptibilityInitialPopulations[[i]],{i,1,susceptibilityBins}],
      Eq[tmin0]==0,ISq[tmin0]==0,RSq[tmin0]==0,IHq[tmin0]==0,HHq[tmin0]==0,
      RepHq[tmin0]==0,RepHCq[tmin0]==0,RHq[tmin0]==0,ICq[tmin0]==0,HCq[tmin0]==0,CCq[tmin0]==0,RCq[tmin0]==0,
      Deaq[tmin0]==0,RepDeaq[tmin0]==0,RepDeaICUq[tmin0]==0,est[tmin0]==0,testAndTraceDelayCounter[tmin0]==0,PCR[tmin0]==0,EHq[tmin0]==0,EHCq[tmin0]==0,cumEq[tmin0]==0}],

  "outputFunctions" -> Flatten[{
      Table[sSq[i],{i,1,susceptibilityBins}],
      Deaq, RepDeaq, RepDeaICUq, PCR, RepHq, RepHCq, Eq, ISq, RSq, IHq, HHq, RHq, ICq, EHq, EHCq, HCq, CCq, RCq, est, testAndTraceDelayCounter, cumEq}],

  "dependentVariables" -> Flatten[{
      Table[sSq[i],{i,1,susceptibilityBins}],
      Deaq, RepDeaq, RepDeaICUq, PCR, RepHq, RepHCq, Eq, ISq, RSq, IHq, HHq, RHq, ICq, EHq, EHCq, HCq, CCq, RCq, est, testAndTraceDelayCounter, cumEq}],
      
  "discreteVariables" -> {},

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
    distpow,
    testAndTrace
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
      hospitalCapacity -> (1-stateParams[state]["bedUtilization"])*stateParams[state]["staffedBeds"]/stateParams[state]["population"],
      testAndTrace -> 0
  }],

  "simulationTestParameters" -> {
    3.315677597140117`,5,7,4,12,0.0480977695615949`,0.7695643129855184`,
    4,10,0.3575906619299291`,52.460287850366974`,3,12.5`,730,0.9015240847617458`,
    0.07427433850312418`,0.024201576735129928`,0.00017764223326223455`,0.0009525570076091405`,
    1.3130347650158096`,1.5775877732714718`,0}
|>;

(* to help speed up the simulations we pre-compute the parametric solutions to the equations for each state / scenario combination *)
getModelComponentsForState[state_] := Association[{#["id"]->generateModelComponents[stateDistancingPrecompute[state][#["id"]]["distancingFunction"]]}&/@scenarios];
getSimModelComponentsForState[state_]:= Association[{#["id"]->Module[{modelComponents, equationsODE, initialConditions, outputODE, dependentVariables, discreteVariables, eventsODE, parameters, parameterizedSolution},
      modelComponents = generateModelComponents[stateDistancingPrecompute[state][#["id"]]["distancingFunction"]];
      equationsODE = modelComponents["equationsODE"];
      initialConditions = modelComponents["initialConditions"];
      outputODE = modelComponents["outputFunctions"];
      dependentVariables = modelComponents["dependentVariables"];
      discreteVariables = modelComponents["discreteVariables"];

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
        DiscreteVariables->{},
        Method->{"DiscontinuityProcessing"->False}
      ];

      <|
        "parameterizedSolution" -> parameterizedSolution,
        "outputODE" -> outputODE
      |>

  ]}&/@scenarios];
  
modelPrecompute = Association[{#->getModelComponentsForState[#]}&/@Keys[fitStartingOverrides]];	
simModelPrecompute = Association[{#->getSimModelComponentsForState[#]}&/@Keys[fitStartingOverrides]];


(* model integrator used for evaluating the model at the expectation values of the fit + literature parameters *)
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


(* simulation integrator which takes a parameterized solution and evaluates it at the simulated values that are passed in *)
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
    soln
  },

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


(* helper to select only values of the simulations within the maximum time domain *)
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
    CumulativeRecoveredQuantiles,
    CurrentlyCriticalQuantiles,
    CurrentlyHospitalizedQuantiles,
    CurrentlyInfectedQuantiles,
    CurrentlyInfectiousQuantiles,
    CumulativeExposedQuantiles,
    CurrentlyReportedHospitalizedQuantiles,
    CurrentlyReportedCriticalQuantiles,
    CurrentlySuseptibleQuantiles,
    CumulativeDeathQuantiles,
    CumulativeReportedDeathQuantiles,
    CumulativeReportedICUDeathQuantiles,
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
    CumulativePCRQuantiles,
    percentPositiveCase,
    population,
    rawSimResults,
    DailyExposedQuantiles,
    DailyPCRQuantiles,
    DailyDeathQuantiles,
    DailyReportedDeathQuantiles,
    DailyReportedICUDeathQuantiles,
    percentileMapTestTrace,
    setDistancing,
    sim,
    simResults,
    sims,
    sol,
    solutionRules,
    summary,
    summaryAug1,
    testSim,
    timeSeriesData,
    rawSimTime,
    modelComponents,
    outputODE,
    parameterizedSolution,
    soltt,
    eventstt,
    paramExpectedtt
  },

  (* the expected parameter values, from fit + literature *)
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
    fitParams["distpow"],
    0
  };
  
  (* the expected parameter values with test and trace turned on (last parameter) *)
  paramExpectedtt = Append[Most[paramExpected], 1];

  (* generate solutions for both the expectation values with and without test and trace *)
  {sol, events} = integrateModel[state, scenario["id"], paramExpected];
  {soltt, eventstt} = integrateModel[state, scenario["id"], paramExpectedtt];

(* used to check the test and trace activation *)
(*  Echo[Plot[soltt[testAndTraceDelayCounter][t],{t,1,365}, ImageSize->250]];
  Echo[Plot[{soltt[cumEq]'[t], testTraceNewCaseThreshold0},{t,1,365}, ImageSize->500]];*)
  
  (* set up dates for simulation / reporting *)
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

  (* once we have generated all the simulations we generate functions that give us the declies of the simulation
  for reporting the error bands *)
  deciles = Range[0,10]/10;

  simDeciles[computationFunction_,simResults_:simResults]:=Quantile[Map[computationFunction, simResults], deciles];
  simMedian[computationFunction_,simResults_:simResults]:=Median[Map[computationFunction, simResults]];

  CurrentlySuseptibleQuantiles[t_] :=  simDeciles[#[Sq][t]&] * population;
  CurrentlyInfectedQuantiles[t_] := simDeciles[#[Eq][t]&] * population;
  CurrentlyInfectiousQuantiles[t_] := simDeciles[#[Iq][t]&] * population;
  CurrentlyHospitalizedQuantiles[t_]:=simDeciles[#[HHq][t]+#[HCq][t]&] * population;
  CurrentlyCriticalQuantiles[t_]:=simDeciles[#[CCq][t]&] * population;
  CumulativeRecoveredQuantiles[t_] := simDeciles[#[Rq][t]&] * population;
  CumulativeDeathQuantiles[t_] := simDeciles[#[Deaq][t]&] * population;

  CumulativeExposedQuantiles[t_]:=simDeciles[#[cumEq][t]&] * population;
  CumulativeHospitalizedQuantiles[t_] := simDeciles[(#[RepHq][t]+#[RepHCq][t])*population &];
  CumulativeCriticalQuantiles[t_] := simDeciles[#[RepHCq][t]*population&];
  CumulativePCRQuantiles[t_] := simDeciles[#[PCR][t]&] * population;
  CumulativeReportedDeathQuantiles[t_] := simDeciles[#[RepDeaq][t]&] * population;
  CumulativeReportedICUDeathQuantiles[t_] := simDeciles[#[RepDeaICUq][t]&] * population;

  DailyPCRQuantiles[t_] := simDeciles[#[PCR]'[t]&] * population;
  DailyExposedQuantiles[t_]:=simDeciles[#[cumEq]'[t]&] * population;
  DailyDeathQuantiles[t_] := simDeciles[#[Deaq]'[t]&] * population;
  DailyReportedDeathQuantiles[t_] := simDeciles[#[RepDeaq]'[t]&] * population;
  DailyReportedICUDeathQuantiles[t_] := simDeciles[#[RepDeaICUq]'[t]&] * population;

  (* TODO: Let's discuss these quantities *)
  CurrentlyReportedHospitalizedQuantiles[t_] := simDeciles[Min[population*(#[HHq][t]+#[HCq][t]),(1-stateParams["params"]["bedUtilization"]*If[distancing[t]<0.7,0.5,1])*stateParams["params"]["staffedBeds"]]&];
  CurrentlyReportedCriticalQuantiles[t_] := simDeciles[Min[population*#[CCq][t],stateParams["params"]["icuBeds"]*If[distancing[t]<0.7,0.85,0.7]]&];

  (* define some helpers to generate percentile keys in the json export like "percentile10" etc. *)
  percentileMap[percentileList_]:=Association[MapIndexed[("percentile" <> ToString[10(First[#2]-1)]) -> #1&, percentileList]];
  percentileMapTestTrace[percentileList_]:=Association[MapIndexed[("percentileTestTrace" <> ToString[10(First[#2]-1)]) -> #1&, percentileList]];
  
  (* get the distancing function so that we can report it in the JSON export as a time series *)
  distancing = stateDistancingPrecompute[state][scenario["id"]]["distancingFunction"];

  (* gather all of our time series information into one large association for exporting to JSON *)
  (* takes the expected solutions and evalutes them at each day in the range, as well as the simulation quantiles *)
  timeSeriesData = Module[{},
    Table[Association[{
          "day"->t,
          "distancing"-><|
            "expected"->distancing[t],
            (* if test and trace is qualified then we fix the distancing at 80% to represent the current state in South Korea *)
            (* but this value is not actually used in the math (only for display) *)
            "expectedTestTrace"->If[soltt[testAndTraceDelayCounter][t] > testTraceExposedDelay0, 0.8, distancing[t]]
          |>,
          "rt"-><|
            "expected"->distancing[t]^fitParams["distpow"]*fitParams["r0natural"]*Sum[susceptibilityValues[[i]]*sol[sSq[i]][t],{i,1,susceptibilityBins}] / Sum[sol[sSq[i]][t],{i,1,susceptibilityBins}],
            (* if test and trace is qualified for we pin r0 to 1 and only allow for it to decrease due to heterogeneity / less available susceptible individuals *)
            "expectedTestTrace"->If[soltt[testAndTraceDelayCounter][t] > testTraceExposedDelay0, 1, distancing[t]^fitParams["distpow"] * fitParams["r0natural"]]*Sum[susceptibilityValues[[i]]*soltt[sSq[i]][t],{i,1,susceptibilityBins}] / Sum[sol[sSq[i]][t],{i,1,susceptibilityBins}]
          |>,
          (* hospital and ICU capacity are ajusted upwards when distancing is higher than 30% *)
          "hospitalCapacity"->(1-stateParams["params"]["bedUtilization"]*If[distancing[t]<0.7,0.5,1])*stateParams["params"]["staffedBeds"],
          "icuCapacity"->stateParams["params"]["icuBeds"]*If[distancing[t]<0.7,0.85,0.7],
          (* we dont predict negative tests yet, but give the confirmed data from COVID tracking for the site *)
          "dailyNegativePcr" -> <|
            "confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["negativeIncrease"]]
          |>,
          
          (* case / fatality time series *)
          "dailyPcr" -> Merge[{
              <|
                "confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["positiveIncrease"]],
                "expected"-> population*(sol[PCR][t] - sol[PCR][t-1]),
                "expectedTestTrace"-> population*(soltt[PCR][t]-soltt[PCR][t-1])
              |>,
              percentileMap[DailyPCRQuantiles[t]]
            }, First],
          "dailyDeath" -> Merge[{
              <|
                "confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["deathIncrease"]],
                "expected"-> population*(sol[Deaq][t] - sol[Deaq][t-1]),
                "expectedTestTrace"-> population*(soltt[Deaq][t]-soltt[Deaq][t-1])
              |>,
              percentileMap[DailyDeathQuantiles[t]]
            }, First],
          "dailyTestsRequiredForContainment" -> <|
            "expected"-> population*testToAllCaseRatio0*(sol[cumEq][t] - sol[cumEq][t-1])|>,
          "cumulativePcr" -> Merge[{
              <|
                "confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["positive"]],
                "expected"-> population*sol[PCR][t],
                "expectedTestTrace"-> population*soltt[PCR][t]
              |>,
              percentileMap[CumulativePCRQuantiles[t]]
            }, First],
          "cumulativeNegativePcr" -> <|
            "confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, If[KeyExistsQ[Select[stateParams["thisStateData"],(#["day"]==t)&][[1]], "negative"],Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["negative"],0]]
          |>,
          "cumulativeExposed"->Merge[{
              <|
                "expected"-> population*sol[cumEq][t],
                "expectedTestTrace"-> population*soltt[cumEq][t]
              |>,
              percentileMap[CumulativeExposedQuantiles[t]]
            }, First],
          "newlyExposed"->Merge[{
              <|
                "expected"-> population*(sol[cumEq][t] - sol[cumEq][t-1]),
                "expectedTestTrace"-> population*(soltt[cumEq][t] - soltt[cumEq][t-1])
              |>,
              percentileMap[DailyExposedQuantiles[t]]
            }, First],
          "cumulativeDeaths" -> Merge[{
              <|
                "expected"-> population*sol[Deaq][t],
                "expectedTestTrace"-> population*soltt[Deaq][t]
              |>,
              percentileMap[CumulativeDeathQuantiles[t]]
            }, First],
          "cumulativeReportedDeaths" -> Merge[{
              <|
                "confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, If[KeyExistsQ[Select[stateParams["thisStateData"],(#["day"]==t)&][[1]],"death"],Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["death"],0]],
                "expected"-> population*sol[RepDeaq][t],
                "expectedTestTrace"-> population*soltt[RepDeaq][t]
              |>,
              percentileMap[CumulativeReportedDeathQuantiles[t]]
            }, First],
          "currentlyInfected" -> Merge[{
              <|"expected"-> population*sol[Eq][t]|>,
              <|"expectedTestTrace"-> population*soltt[Eq][t]|>,
              percentileMap[CurrentlyInfectedQuantiles[t]]
            }, First],
          "currentlyInfectious" -> Merge[{
              <|
                "expected"-> population*sol[Iq][t],
                "expectedTestTrace"-> population*soltt[Iq][t]
              |>,
              percentileMap[CurrentlyInfectiousQuantiles[t]]
            }, First],
          "cumulativeRecoveries" -> Merge[{
              <|
                "expected"-> population*sol[Rq][t],
                "expectedTestTrace"-> population*soltt[Rq][t]
              |>,
              percentileMap[CumulativeRecoveredQuantiles[t]]
            }, First],
          "susceptible" -> Merge[{
              <|
                "expected"-> population*sol[Sq][t],
                "expectedTestTrace"-> population*soltt[Sq][t]
              |>,
              percentileMap[CurrentlySuseptibleQuantiles[t]]
            }, First],
            
          (* hospitalization and ICU time series *)
          "currentlyReportedHospitalized" -> Merge[{
              <|
                "confirmed"->If[
                  Length[Select[stateParams["hospitalizationCurrentData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["hospitalizationCurrentData"],
                      (#["day"]==t)&][[1]],"hospitalizations"],
                  Select[stateParams["hospitalizationCurrentData"],(#["day"]==t)&][[1]]["hospitalizations"],
                  0],
                "expected"-> Min[population*(sol[HHq][t - daysForHospitalsToReportCases0]+sol[HCq][t - daysForHospitalsToReportCases0]), (1-stateParams["params"]["bedUtilization"]*If[distancing[t]<0.7,0.5,1])*stateParams["params"]["staffedBeds"]],
                "expectedTestTrace"-> Min[population*(soltt[HHq][t - daysForHospitalsToReportCases0]+soltt[HCq][t - daysForHospitalsToReportCases0]), (1-stateParams["params"]["bedUtilization"]*If[distancing[t]<0.7,0.5,1])*stateParams["params"]["staffedBeds"]]
              |>,
              percentileMap[CurrentlyReportedHospitalizedQuantiles[t - daysForHospitalsToReportCases0]]
            }, First],
          "currentlyHospitalized" -> Merge[{
              <|
                "expected"-> population*(sol[HHq][t]+sol[HCq][t]),
                "expectedTestTrace"-> population*(soltt[HHq][t]+soltt[HCq][t])
              |>,
              percentileMap[CurrentlyHospitalizedQuantiles[t]]
            }, First],
          "cumulativeReportedHospitalized" -> Merge[{
              <|
                "confirmed"->If[
                  Length[Select[stateParams["hospitalizationCumulativeData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["hospitalizationCumulativeData"],
                      (#["day"]==t)&][[1]],"hospitalizations"],
                  Select[stateParams["hospitalizationCumulativeData"],(#["day"]==t)&][[1]]["hospitalizations"],
                  0],
                "expected"->population*(sol[RepHq][t - daysForHospitalsToReportCases0]+sol[RepHCq][t - daysForHospitalsToReportCases0]),
                "expectedTestTrace"-> population*(soltt[RepHq][t - daysForHospitalsToReportCases0]+soltt[RepHCq][t - daysForHospitalsToReportCases0])
              |>,
              percentileMap[CumulativeHospitalizedQuantiles[t - daysForHospitalsToReportCases0]]
            }, First],
          "cumulativeHospitalized" -> Merge[{
              <|
                "expected"->population*(sol[EHq][t]+sol[EHCq][t]),
                "expectedTestTrace"->population*(soltt[EHq][t]+soltt[EHCq][t])
              |>,
              percentileMap[CumulativeHospitalizedQuantiles[t]]
            }, First],
          "cumulativeCritical" -> Merge[{
              <|
                "confirmed"->If[
                  Length[Select[stateParams["icuCumulativeData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["icuCumulativeData"],
                      (#["day"]==t)&][[1]],"icu"],
                  Select[stateParams["icuCumulativeData"],(#["day"]==t)&][[1]]["icu"],
                  0],
                "expected"->population*(sol[RepHCq][t - daysForHospitalsToReportCases0]),
                "expectedTestTrace"->population*(soltt[RepHCq][t - daysForHospitalsToReportCases0])
              |>,
              percentileMap[CumulativeCriticalQuantiles[t]]
            }, First],
          "currentlyHospitalizedOrICU" -> Merge[{
            <|"expected"->population*(sol[HHq][t]+sol[HCq][t]+sol[CCq][t])|>,
            <|"expectedTestTrace"->population*(soltt[HHq][t]+soltt[HCq][t]+soltt[CCq][t])|>
          },First],
          "currentlyCritical" -> Merge[{
              <|
                "confirmed"->If[
                  Length[Select[stateParams["icuCurrentData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["icuCurrentData"],
                      (#["day"]==t)&][[1]],"icu"],
                  Select[stateParams["icuCurrentData"],(#["day"]==t)&][[1]]["icu"],
                  0],
                "expected"->population*sol[CCq][t],
                "expectedTestTrace"-> population*soltt[CCq][t]
              |>,
              percentileMap[CurrentlyCriticalQuantiles[t]]
            }, First]
      }], {t, Floor[fitParams["importtime"]] - 5, endOfEval}]];

  (* define events / helpers for reporting, eg when we exceed capacity *)
  hasContainment = KeyExistsQ[events, "containment"];
  hasHospitalOverload = KeyExistsQ[events, "hospital"];
  hasIcuOverload = KeyExistsQ[events, "icu"];

  containmentTime = If[hasContainment,events["containment"]["day"]];
  hospitalOverloadTime = If[hasHospitalOverload,events["hospital"]["day"]];
  icuOverloadTime = If[hasIcuOverload,events["icu"]["day"]];

  (* generate summary statistics at 2 years from the start (end of 2021) and August 1st *)
  (* we use these to check against literature values in the paramter table *)
  (* https://docs.google.com/spreadsheets/d/1DH58EFf_YkWHa_zn8-onBGzsYFMamjSjOItr137vu9g/edit#gid=0 *)
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
        "fractionOfSymptomaticHospitalizedOrICU"-> (sol[EHq][t]+sol[EHCq][t]) / (fractionSymptomatic0 * sol[cumEq][t]),
        "fractionOfPCRHospitalized"-> sol[RepHq][t] / sol[PCR][t],
        "fractionOfPCRHospitalizedOrICU"-> (sol[RepHq][t] + sol[RepHCq][t]) / sol[PCR][t],
        "fractionHospitalizedInICU"->(sol[EHCq][t]) / (sol[EHq][t] + sol[EHCq][t]),
        "fractionOfDeathInICU"->(sol[RepDeaICUq][t]) / (sol[RepDeaq][t]),
        "fractionDeathOfHospitalizedOrICU"->((sol[EHCq][t]) / (sol[EHq][t] + sol[EHCq][t]))*(fractionOfCriticalDeceased0 + (1 - ((sol[EHCq][t]) / (sol[EHq][t] + sol[EHCq][t])))*fractionOfHospitalizedNonCriticalDeceased0/((sol[EHCq][t]) / (sol[EHq][t] + sol[EHCq][t]))),
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

  (* gather all the data we've generated for exporting *)
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
(* this function's primary job is to fit the model to the data *)
(* at the end it calls evaluateScenario  which runs the simulations in that scenario *)
(* and at the end it returns a large object containing all the time series for the fitted / simulated model as well as summary statistics *)
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
    discreteVariablesODE,
    parameters,
    RepDeaqParametric,
    DeaqParametric,
    PCRParametric,
    SqParametric,IqParametric,RqParametric,EqParametric,
    sSq1Parametric, sSq2Parametric, sSq3Parametric, sSq4Parametric, sSq5Parametric, ISqParametric, ICqParametric, IHqParametric, RSqParametric, RHqParametric, RCqParametric,
    HHqParametric, HCqParametric, CCqParametric,
    rlower,
    rupper,
    tlower,
    tupper,
    replower,
    repupper,
    powlower,
    powupper,
    deathDataLength,
    output,
    paramExpected,
    fittime,
    parametricSolution,
    evaluateSolution,
    simulatedScenarioRuns
  },

  modelComponents = modelPrecompute[state]["scenario1"];

  percentPositiveCase[t_]:=posInterpMap[state][t];
  
  (* extract per-state parameters and data sets *)
  params=stateParams[state];
  icuCapacity=params["icuBeds"]/params["population"];
  hospitalCapacity=(1-params["bedUtilization"])*params["staffedBeds"]/params["population"];
  hospitalizationCurrentData = stateHospitalizationCurrentActualsData[state];
  hospitalizationCumulativeData = stateHospitalizationCumulativeActualsData[state];
  icuCurrentData = stateICUCurrentActualsData[state];
  icuCumulativeData = stateICUCumulativeActualsData[state];

  (* log transform the equations for an easier time fitting (per recommendation from Wolfram) *)
  logTransform = Thread[{r0natural,importtime,stateAdjustmentForTestingDifferences,distpow}->Exp[{logR0Natural,logImportTime,logStateAdjustmentForTestingDifferences,logDistpow}]];
  equationsODE = modelComponents["equationsODE"]/.modelComponents["replaceKnownParameters"][state]/.logTransform;
  eventsODE = modelComponents["parametricFitEvents"]/.modelComponents["replaceKnownParameters"][state]/.logTransform;
  initialConditions = modelComponents["initialConditions"];
  dependentVariablesODE = modelComponents["dependentVariables"];
  discreteVariablesODE = modelComponents["discreteVariables"];
  parameters = {logR0Natural, logImportTime, logStateAdjustmentForTestingDifferences, logDistpow};

  (* generate parametric solutions to the equations that can be used for the fitting to reported fatalities and PCR confirmed cases *)
  outputODE = {RepDeaq, PCR};
  parametricSolution = ParametricNDSolve[
    {equationsODE, eventsODE, initialConditions},
    outputODE,
    {t,tmin0,tmax0},
    parameters,
    DependentVariables->dependentVariablesODE,
    DiscreteVariables->discreteVariablesODE,
    Method->{"DiscontinuityProcessing"->False}
  ];
  evaluateSolution[f_]:=f/.parametricSolution;

  (* get the bounds of the parameters to avoid local minima *)
  {rlower, rupper, tlower, tupper, replower, repupper, powlower, powupper}=getBounds[state];
  
  (* get the fatality and PCR data for this state *)
  thisStateData=Select[parsedData,(#["state"]==state&&#["positive"]>50)&];

  (* merge the data together into a long format with an indicator variable to make the fitting easier *)
  longData=Select[Join[
      {1,#["day"],If[TrueQ[#["death"]==Null],0,(#["death"]/params["population"])//N]}&/@thisStateData,
      {2,#["day"],(#["positive"]/params["population"])//N}&/@thisStateData
    ],#[[3]]>0&];
  deathDataLength=Length[Select[longData,#[[1]]==1&]];

  (* generate the model to fit using the parametric equations and the indicator variables *)
  model[r0natural_,importtime_,stateAdjustmentForTestingDifferences_,distpow_,c_][t_]:=Piecewise[{
      {evaluateSolution[RepDeaq][r0natural,importtime,stateAdjustmentForTestingDifferences, distpow][t],c==1},
      {evaluateSolution[PCR][r0natural,importtime,stateAdjustmentForTestingDifferences, distpow][t] ,c==2}
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

  (* run the fitting algorithm to the non-linear equations *)
  (* we also apply the parameter bounds here *)
  (* to help avoid local minima as much as possible (not enough) we use SimulatedAnnealing which is a global optimization method *)
  (* to keep output results consistent we fix the random seed, although once the correct minima is obtained this is not strictly necessary as it remains consistent *)
  fit=NonlinearModelFit[
      longData,
      {
        model[r0natural,importtime,stateAdjustmentForTestingDifferences,distpow,c][t],
        Log[rlower]<=r0natural<=Log[rupper],
        Log[tlower]<=importtime<=Log[tupper],
        Log[powlower]<=distpow<= Log[powupper],
        Log[replower]<= stateAdjustmentForTestingDifferences<=Log[repupper]
      },
      {
        {r0natural,Log[(rlower+rupper)/2]},
        {importtime,Log[(tlower+tupper)/2]},
        {stateAdjustmentForTestingDifferences,Log[(replower+repupper)/2]},
        {distpow, 1.8}
      },{c,t},
      Method->{"NMinimize",Method->{"SimulatedAnnealing", "RandomSeed"->111}},
      Weights->dataWeights
  ];

  (* once we fit the model we map back to the un-logged values for the parameters *)
  fitParams=Exp[#]&/@KeyMap[ToString[#]&, Association[fit["BestFitParameters"]]];
  (* quiet because of constraint boundary warning -- we have constraints so as to prevent certain local minima from happening
	in the SimulatedAnnealing global search, but intentionally choose vallues of the constraint boundary so that the fit is unlikely to run into the boundary
	and thus we feel okay about using the variance estimates *)
  standardErrors=Quiet[Exp[#]&/@KeyMap[ToString[#]&, AssociationThread[{r0natural,importtime,stateAdjustmentForTestingDifferences,distpow},
          fit["ParameterErrors", ConfidenceLevel->0.97]]], {FittedModel::constr}];
  (* once we have the fit use the residuals to evaluate some goodness of fit metrics *)
  gofMetrics=goodnessOfFitMetrics[fit["FitResiduals"],longData,params["population"]];

  Echo[gofMetrics];

  Echo[
    Column[{
        Text["Fit for "<>state],
        Row[{
            Show[
              ListLogPlot[Cases[longData,{#, t_,c_}:>{t,c}]&/@{1,2},ImageSize->500,PlotRange->{{40,150},{0,Automatic}}],
              LogPlot[{
                  evaluateSolution[RepDeaq][Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t],
                  evaluateSolution[PCR][
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
  
  (* generate a json for the parameter values with some additional metadata for the site *)
  paramExpected = <|
    "r0"-> <|"value"-> fitParams["r0natural"], "name"->"Basic reproduction number", "description"-> "The basic reproduction number.", "type"->"fit","citations"->{}|>,
    "daysUntilNotInfectious"-><|"value"-> daysUntilNotInfectious0, "name"-> "Days until not infectious", "description"-> "The number of days it takes to lose infectiousness after starting on average.", "type"->"literature",
      "citations"->{"https://www.medrxiv.org/content/10.1101/2020.03.24.20042606v1.full.pdf","https://www.nature.com/articles/s41586-020-2196-x_reference.pdf"}|>,
    "daysUntilHospitalized"-><|"value"-> daysUntilHospitalized0, "name"-> "Days until hospitalized", "description"-> "The number of days it takes to become hospitalized, if you are going to, after becoming infectious on average.", "type"->"literature",
      "citations"->{"https://www.medrxiv.org/content/medrxiv/early/2020/01/28/2020.01.26.20018754.full.pdf", "https://www.medrxiv.org/content/10.1101/2020.03.03.20029983v1.full.pdf", "https://www.medrxiv.org/content/10.1101/2020.03.03.20028423v3.full.pdf", "https://www.medrxiv.org/content/10.1101/2020.04.12.20062943v1.full.pdf"}|>,
    "daysFromInfectedToInfectious"-><|"value"-> daysFromInfectedToInfectious0, "name"-> "Days from infected to infectious", "description"-> "The number of days it takes to become infectious after being infected on average", "type"->"literature",
      "citations"->{"https://www.medrxiv.org/content/10.1101/2020.03.24.20042606v1.full.pdf", "https://annals.org/aim/fullarticle/2762808/incubation-period-coronavirus-disease-2019-covid-19-from-publicly-reported", "https://www.medrxiv.org/content/medrxiv/early/2020/01/28/2020.01.26.20018754.full.pdf"}|>,
    "daysToLeaveHosptialNonCritical"-><|"value"-> daysToLeaveHosptialNonCritical0, "name"-> "Days to leave the hospital in a non-critical case", "description"-> "The number of days it takes to leave the hospital if you are not a critical case", "type"->"literature",
      "citations"->{"https://www.medrxiv.org/content/10.1101/2020.03.03.20029983v1", "https://www.medrxiv.org/content/10.1101/2020.04.12.20062943v1.full.pdf"}|>,
    "pPCRNH"-><|"value"-> params["pPCRNH"], "name"-> "Probability of getting a positive PCR test if you are not in the hospital", "description"-> "An age-adjusted probability that you get a positive PCR test if your disease is not serious enough to require hospitalization or critical care.", "type"->"literature"|>,
    "pPCRH"-><|"value"-> params["pPCRH"], "name"-> "Probability of getting a positive PCR test if you are in the hospital or ICU,", "description"-> "An age-adjusted probability that you get a positive PCR test in cases that require hospitalization or critical care", "type"->"literature",
      "citations"->{"https://www.medrxiv.org/content/10.1101/2020.04.12.20062943v1.full.pdf"}|>,
    "daysTogoToCriticalCare"-><|"value"-> daysTogoToCriticalCare0, "name"-> "Days to go to critical care after arriving in the hospital", "description"-> "The number of days it takes to go to critical care after arriving in the hospital in a serious case.", "type"->"literature",
      "citations"->{"https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)30566-3/fulltext", "https://jamanetwork.com/journals/jama/fullarticle/2761044", "https://www.nejm.org/doi/pdf/10.1056/NEJMoa2004500?articleTools=true"}|>,
    "daysFromCriticalToRecoveredOrDeceased"-><|"value"-> daysFromCriticalToRecoveredOrDeceased0, "name"-> "Days from an ICU admission to recovery or fatality", "description"-> "The number of days it takes on average to resolve an ICU admission on average", "type"->"literature",
      "citations"->{"https://www.icnarc.org/DataServices/Attachments/Download/b5f59585-5870-ea11-9124-00505601089b", "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)30566-3/fulltext", "https://www.nejm.org/doi/pdf/10.1056/NEJMoa2004500?articleTools=true", "https://www.medrxiv.org/content/10.1101/2020.04.08.20057794v1.full.pdf", "https://www.medrxiv.org/content/medrxiv/early/2020/01/28/2020.01.26.20018754.full.pdf", "https://www.medrxiv.org/content/10.1101/2020.04.12.20062943v1.full.pdf"}|>,
    "fractionOfCriticalDeceased"-><|"value"-> params["fractionOfCriticalDeceased"], "name"-> "Fraction of ICU admissions deceased.", "description"-> "An age adjusted fraction of the ICU admissions that will be deceased.", "type"->"literature",
      "citations"->{"https://www.icnarc.org/DataServices/Attachments/Download/b5f59585-5870-ea11-9124-00505601089b", "https://jamanetwork.com/journals/jama/fullarticle/2762130", "https://www.medrxiv.org/content/10.1101/2020.04.08.20057794v1.full.pdf"}|>,
    "importtime"-><|"value"-> fitParams["importtime"], "name"-> "Import Time", "description"-> "The day that COVID-19 was seeded into that state.", "type"->"fit"|>,
    "importlength"-><|"value"-> importlength0, "name"-> "Import duration", "description"-> "Duration of the covid seeding event -- together with the initial infection impulse gets the model kicked off starting at the import time.", "type"->"assumed"|>,
    "initialInfectionImpulse"-><|"value"-> params["initialInfectionImpulse"], "name"-> "Size of initial infection impulse", "description"-> "Size of the initial infection impulse. The model is not very sensitive to the exact value, but it is needed in order to start the virus spreading.", "type"->"assumed"|>,
    "pS"-><|"value"-> params["pS"], "name"-> "Probability of getting a mild case.", "description"-> "An age-adjusted probability that you get a mild case.", "type"->"literature"|>,
    "pH"-><|"value"-> params["pH"], "name"-> "Probability of getting a case bad enough to require hospitalization.", "description"-> "An age-adjusted probability that you get a case requiring hospitalization.", "type"->"literature",
      "citations"->{"https://www.cdc.gov/mmwr/volumes/69/wr/mm6912e2.htm#F1_down", "https://www.medrxiv.org/content/10.1101/2020.04.08.20057794v1.full.pdf"}|>,
    "pC"-><|"value"-> params["pC"], "name"-> "Probability of getting a case bad enough to require ICU admission", "description"-> "An age-adjusted probability get a severe case requiring ICU admission.", "type"->"literature"|>,
    "stateAdjustmentForTestingDifferences"-><|"value"-> fitParams["stateAdjustmentForTestingDifferences"], "name"-> "State adjustment for differences in PCR / death testing and reporting.", "description"-> "A parameter fit to adjust the time difference between PCR and fatality reporting on a state by state basis", "type"->"fit"|>,
    "distancePower"-><|"value"-> fitParams["distpow"], "name"-> "Power of the distancing function", "description"-> "Social distancing effect on reducing susceptibility has a larger effect when densities are higher (eg the original R0 is higher). So we fit a power of the distancing function.", "type"->"fit"|>,
    "numberOfSimulations"-><|"value"->numberOfSimulations, "name"->"Number of Monte Carlo simulations run", "description"->"","type"->"set"|>
  |>;

  (* run simulations and compute expectations for each of the scenarios *)
  (* this gives back both time series data and summary data at August 1st and 2 years out *)
  simulatedScenarioRuns=Association[
          {#["id"]->evaluateScenario[state,fitParams,standardErrors,
              <|"params"->params,
                "thisStateData"->thisStateData,
                "icuCapacity"->icuCapacity,
                "hospitalCapacity"->hospitalCapacity,
                "hospitalizationCurrentData" -> hospitalizationCurrentData,
                "hospitalizationCumulativeData" -> hospitalizationCumulativeData,
                "icuCurrentData" -> icuCurrentData,
                "icuCumulativeData" -> icuCumulativeData
              |>, #, numberOfSimulations]}&/@scenarios];
  
  output = Merge[{
      <|"scenarios"->simulatedScenarioRuns|>,
      <|"parameterBest"->fitParams|>,
      KeyDrop[stateParams[state],{"R0","importtime0"}],
      "r0"->fitParams["r0natural"],
      "importtime"->fitParams["importtime"],
      "numberOfSimulations"->numberOfSimulations,
      "dateModelRun"->DateString[Now],
      "mostRecentDistancingDate"->mostRecentDistancingDay,
      "stateAdjustmentForTestingDifferences"->fitParams["stateAdjustmentForTestingDifferences"],
      "distpow"->fitParams["distpow"],
      "goodnessOfFitMetrics"->gofMetrics,
      "parameters"->paramExpected
    }, First];

  (* plot hospitalization against the predicted curves *)
  Echo[plotStateHospitalization[output, state]];

  output
]


(* export the full model data, Warning: paralllize will eat a lot of laptop resources while it evaluates *)
evaluateStateAndPrint[state_, simulationsPerCombo_:1000]:=Module[{},
  Print["Fitting model for " <> state];
  evaluateState[state, simulationsPerCombo]
];


(* helpers to generate the summary csv files that show the model 2 years out and on Aug 1 *)
generateSummaryForState[data_, state_]:= Module[{},
  Join[{state},Values[Association[Join[
          KeyDrop[KeyDrop[KeyDrop[data["scenarios"][#],"timeSeriesData"],"events"],"summary"],
          data["scenarios"][#]["summary"]
    ]]],
    {
      data["r0"],
      data["importtime"],
      data["stateAdjustmentForTestingDifferences"],
      data["distpow"]
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
      data["stateAdjustmentForTestingDifferences"],
      data["distpow"]
    }
  ]&/@Keys[data["scenarios"]]
];


(* write the summaries to csv files *)
exportAllStatesSummary[allStates_]:=Module[{header, rows, table},
  header = {Append[Prepend[Keys[
          Association[Join[
              KeyDrop[KeyDrop[KeyDrop[allStates[Keys[allStates][[1]]]["scenarios"]["scenario1"],"timeSeriesData"],"events"],"summary"],
              allStates[Keys[allStates][[1]]]["scenarios"]["scenario1"]["summary"]
        ]]],"state"], {"r0natural","importtime","stateAdjustmentForTestingDifferences","distpow"}]};
  rows = generateSummaryForState[allStates[#],#]&/@Keys[allStates];

  table = Flatten[Join[{header}, rows],1];

  Export["tests/summary.csv", table];
]

exportAllStatesSummaryAug1[allStates_]:=Module[{header, rows, table},
  header = {Append[Prepend[Keys[
          Association[Join[
              KeyDrop[KeyDrop[KeyDrop[allStates[Keys[allStates][[1]]]["scenarios"]["scenario1"],"timeSeriesData"],"events"],"summaryAug1"],
              allStates[Keys[allStates][[1]]]["scenarios"]["scenario1"]["summaryAug1"]
        ]]],"state"], {"r0natural","importtime","stateAdjustmentForTestingDifferences", "distpow"}]};
  rows = generateSummaryForState[allStates[#],#]&/@Keys[allStates];

  table = Flatten[Join[{header}, rows],1];

  Export["tests/summaryAug1.csv", table];
]

getSeriesForKey[data_, key_]:=Module[{},
  #[key]&/@data
];

(* export each time series as a separate JSON file *)
(* each time series has expected, expectedTestTrace and percentile bands as well as confirmed data points when those are available *)
exportTimeSeries[state_, scenario_, data_]:=Module[{timeData, fixedKeys, timeDataKeys, days, distancing, hospitalCapacity},
  fixedKeys = {"day", "distancing", "hospitalCapacity"};
  timeData = Select[data["timeSeriesData"], #["day"]<=370&];
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

    Export["public/json/"<>state<>"/days.json", Select[days, #<=370&]];
    Export["public/json/"<>state<>"/summary.json",Merge[{
          KeyDrop[stateData, {"scenarios"}],
          <|"scenarios"->(#["id"]&/@scenarios)|>
        }
        ,First]];
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
