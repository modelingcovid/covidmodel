(* ::Package:: *)

(** Model parameters. See https://docs.google.com/spreadsheets/d/1DH58EFf_YkWHa_zn8-onBGzsYFMamjSjOItr137vu9g/edit#gid=0 **)
SetDirectory[$UserDocumentsDirectory<>"/Github/covidmodel"];

(* In mathematica imported code is executed *)
(* these load some data from various sources, and generate helper functions for evaluating statistics and generating plots *)
Import["model/data.wl"];
Import["model/gof-metrics.wl"];
Import["model/plot-utils.wl"];

statesToRun={"AZ", "CA", "FL", "PA", "CO", "TX", "WA", "CT", "OH", "NY", "VA", "VT", "LA", "MI", "MS", "MA", "MD", "GA", "NJ", "IL", "IN", "OK", "WI", "NV", "OR", "SC"};


(* Fixed parameters from the literature *)
(* We pull these from various studies and surveys and record them here *)
(* https://docs.google.com/spreadsheets/d/1DH58EFf_YkWHa_zn8-onBGzsYFMamjSjOItr137vu9g/edit#gid=0 *)

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

(****
Heterogeneous susceptibility:
Separate the susceptible population into bins of (initially) equal size. Assign to each bin a relative susceptibility
using a log-normal susceptibility distribution having mean 1 and adjustable standard deviation. The population-weighted
average (which initially is a simple average) of these susceptibilities must be 1 to preserve the intended meaning of
R0.

As the infection progresses, individuals in bins of higher relative susceptibility become infected more frequently,
depleting the population in those bins and lowering the average relative susceptibility of the currently susceptible
population. At late times, this has the effect of limiting the number of individuals who become infected. We choose
a standard deviation of 1.2 so that roughly 70% of individuals become infected in unconstrained models.
****)
susceptibilityValuesLogNormal[binCount_,stdDev_]:=Module[{m, s, dist, binEdges, unnormalizedRelativeSusceptibilities},
  m = -stdDev^2 / 2;
  s = Sqrt[Log[stdDev^2 + 1]];
  dist = LogNormalDistribution[m,s];
  binEdges = InverseCDF[dist, Range[0, binCount] / binCount];
  unnormalizedRelativeSusceptibilities = Table[
    NIntegrate[x PDF[dist,x], {x, binEdges[[i]], binEdges[[i+1]]}], {i, 1, binCount}];
  binCount unnormalizedRelativeSusceptibilities / Total[unnormalizedRelativeSusceptibilities]
];
susceptibilityBins = 10;
susceptibilityStdev0 = 1.2;
susceptibilityInitialPopulations = ConstantArray[1/susceptibilityBins, susceptibilityBins];
susceptibilityValues = susceptibilityValuesLogNormal[susceptibilityBins, susceptibilityStdev0];


(* Compute age adjusted parameters per-state *)

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


(* we import utilites after defining the parameters since some of the utils need the input parameters to evaluate *)
Import["model/utils.wl"];


(* define function to organize / pre-compute state level parameters, some of which are age adjusted as per above, some of which we get from sources (like icuBeds)  *)
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

stateParams = Association[{#->getStateParams[#]}&/@statesToRun];


testAndTraceSmoothTurnOnDuration = 7;
testAndTraceTurnOff[testAndTrace_, days_]:=If[testAndTrace == 0, 1, Max[0, Min[1, 1 - (days - testTraceExposedDelay0) / testAndTraceSmoothTurnOnDuration]]]


(* Define the model to be evaulated in the simulations -- all parameters are given either from the Monte-Carlo draws or evaluting the means *)
(* This defines an enriched SEIR model with extra states (e.g., hospitalized, deceased) and reporting (e.g., cumulative PCR rates) *)
(* It also fires several events for things like when the hospital / icu capacities are exceeded so that those don't have to be computed manually later *)
generateModelComponents[distancing_] := <|
  "equationsODE" -> Flatten[{
      (**** Enriched SEIR model section ****)
      (* Quantities that relate directly to the enriched SEIR model [for clarity, avoid putting reporting quantities in this section] *)

      (* Susceptible population, binned into (initially equally sized) groups having a range of relative susceptibilities; the sum of all sSq[i]'s is Sq, the full susceptible population *)
      Table[
        sSq[i]'[t]==(
          distancing[t]^distpow * r0natural * testAndTraceTurnOff[testAndTrace, testAndTraceDelayCounter[t]] + (1 - testAndTraceTurnOff[testAndTrace, testAndTraceDelayCounter[t]])
        ) * (-susceptibilityValues[[i]] * (ISq[t]/daysUntilNotInfectious + (IHq[t] + ICq[t])/daysUntilHospitalized) - est[t]) * sSq[i][t],
        {i, 1, susceptibilityBins}],

      (* Exposed *)
      Eq'[t]==(
        distancing[t]^distpow * r0natural * testAndTraceTurnOff[testAndTrace, testAndTraceDelayCounter[t]] + (1 - testAndTraceTurnOff[testAndTrace, testAndTraceDelayCounter[t]])
      ) * Sum[(susceptibilityValues[[i]] * (ISq[t]/daysUntilNotInfectious + (IHq[t] + ICq[t])/daysUntilHospitalized) + est[t]) * sSq[i][t], {i, 1, susceptibilityBins}] - Eq[t]/daysFromInfectedToInfectious,

      (* Infected who won't need hospitalization or ICU care (not necessarily PCR confirmed); age independent *)
      ISq'[t]==pS*Eq[t]/daysFromInfectedToInfectious - ISq[t]/daysUntilNotInfectious,
      (* Recovered without needing care *)
      RSq'[t]==ISq[t]/daysUntilNotInfectious,

      (* Infected and will eventually need hospital (but not need critical care) *)
      IHq'[t]==pH*Eq[t]/daysFromInfectedToInfectious - IHq[t]/daysUntilHospitalized,
      (* Going to hospital *)
      HHq'[t]==IHq[t]/daysUntilHospitalized - HHq[t]/daysToLeaveHosptialNonCritical,
      (* Recovered after hospitalization *)
      RHq'[t]==(1 - fractionOfHospitalizedNonCriticalDeceased0) * HHq[t]/daysToLeaveHosptialNonCritical,

      (* Infected and will eventually need critical care *)
      ICq'[t]==pC*Eq[t]/daysFromInfectedToInfectious - ICq[t]/daysUntilHospitalized,
      (* Hospitalized and will eventually need critical care *)
      HCq'[t]==ICq[t]/daysUntilHospitalized - HCq[t]/daysTogoToCriticalCare,
      (* Entering critical care *)
      CCq'[t]==HCq[t]/daysTogoToCriticalCare - CCq[t]/daysFromCriticalToRecoveredOrDeceased,
      (* Recovered after critical care *)
      RCq'[t]==(1 - fractionOfCriticalDeceased) * CCq[t]/daysFromCriticalToRecoveredOrDeceased,

      (* Deceased *)
      Deaq'[t]==fractionOfHospitalizedNonCriticalDeceased0 * HHq[t]/daysToLeaveHosptialNonCritical + fractionOfCriticalDeceased * CCq[t]/daysFromCriticalToRecoveredOrDeceased,

      (**** Reporting section ****)
      (* These quantities measure testing rates, cumulative reporting-only counts, etc. in this section *)

      (* Cumulative exposed *)
      cumEq'[t]==(
          distancing[t]^distpow * r0natural * testAndTraceTurnOff[testAndTrace, testAndTraceDelayCounter[t]] + (1 - testAndTraceTurnOff[testAndTrace, testAndTraceDelayCounter[t]])
        ) * Sum[(susceptibilityValues[[i]] * (ISq[t]/daysUntilNotInfectious + (IHq[t] + ICq[t])/daysUntilHospitalized) + est[t]) * sSq[i][t], {i, 1, susceptibilityBins}],
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

      (* Cumulative PCR confirmed and reported deaths (both hospitalized and ICU) *)
      RepDeaq'[t]==testingProbability[t] * Deaq'[t],
      (* Cumulative PCR confirmed and reported ICU deaths *)
      RepDeaICUq'[t]==testingProbability[t] * fractionOfCriticalDeceased * CCq[t]/daysFromCriticalToRecoveredOrDeceased,

      (* Establishment *)
      est'[t]==0,
      
      (* Test and trace tracker: this counts the number of days after testing and tracing becomes viable *)
      testAndTraceDelayCounter'[t] == If[testAndTraceDelayCounter[t] > 0, 1, 0]
  }],

  (* events used in evaluting the simluations / expectation values *)
  "simulationEvents" -> {
    (* Reporting events *)
    WhenEvent[RSq[t]+RSq[t]+RCq[t]>=0.7, Sow[{t,RSq[t]+RSq[t]+RCq[t]},"herd"]],
    WhenEvent[CCq[t]>=icuCapacity, Sow[{t,CCq[t]},"icu"]],(*ICU Capacity overshot*)
    WhenEvent[HHq[t]>=hospitalCapacity, Sow[{t,HHq[t]},"hospital"]],(*Hospitals Capacity overshot*)
    (* initial infection impulse events *)
    WhenEvent[t>=importtime, est[t]->Exp[-initialInfectionImpulse]],
    WhenEvent[t>importtime+importlength, est[t]->0],
    (* test and trace becomes viable event when the rate of new infections falls below the threshold *)
    WhenEvent[
      cumEq'[t] - testTraceNewCaseThreshold0 == 0 && t > today && testAndTrace == 1 && cumEq[t]<=0.5,
      {testAndTraceDelayCounter[t]->1, Sow[{t,cumEq[t]}, "containment"], "RemoveEvent"},
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
  }]
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

(* TODO: move these calls into the evaluateAllStates routine so that we don't have to reinclude this file inorder to pick up changes in the model *)
modelPrecompute = Association[{#->getModelComponentsForState[#]}&/@statesToRun];	
simModelPrecompute = Association[{#->getSimModelComponentsForState[#]}&/@statesToRun];


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


(* TODO: DRY this code by merging it with the previous integration function *)
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


(* Simulated parameter value generator *)

(* define some helper distributions and set up all the parameters that need to be simulated *)
BetaMeanSig[mu_,sig_]:=BetaDistribution[(mu^2-mu^3-mu sig)/sig,((-1+mu) (-mu+mu^2+sig))/sig];
PosNormal[mu_,sig_]:=TruncatedDistribution[{0,\[Infinity]},NormalDistribution[mu,sig]]

(* a function to generate the monte carlo simulations from combo of fit / assumed parameters *)
(* for the assumed parameters we temporarily have a 5% stdev, but we will replace this with a calculated one when we have multiple literature sources *)
(* we mostly use normal distributions of those variables, truncated to keep them positive (physical constraint) *)
(* TODO why do we use truncated normal distributions instead of log-normal (which is probably more realistic)? *)
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


(* Given a set fit parameters, simulated parameters and a definition of a scenario, run all the simulations and produce the quantiles for the mean and confidence band estimates *)
evaluateScenario[state_, fitParams_, standardErrors_, stateParams_, scenario_, numberOfSimulations_:100]:=Module[{
    aug1,
    containmentTime,
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
    percentPositiveCase,
    population,
    rawSimResults,
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
  
  Echo[Plot[{sol[cumEq]'[t], soltt[cumEq]'[t], testTraceNewCaseThreshold0}, {t, 150, 200}, ImageSize->500, PlotStyle->{{},{Dashed},{}}]];
  
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

  (* integrate the model for each of the simulated parameter values *)
  outputODE = modelComponents["outputODE"];
  parameterizedSolution = modelComponents["parameterizedSolution"];

  rawSimResults=Map[integrateModelSim[parameterizedSolution, outputODE, #][[1]]&, sims];
  simResults=Select[rawSimResults, endTime[#[Sq]]>=endOfEval&];

  (* organize the simulation / expectation outputs into a time series array *)
  timeSeriesData=generateTimeSeries[state,scenario,sol,soltt,simResults,fitParams,stateParams,population,endOfEval];
  {summary, summaryAug1}=generateSummaries[events,eventstt,sol,population,timeSeriesData,endOfEval,endOfEvalAug1];

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
  "CO"-><|"rlower"->3.3,"rupper"->5,"tlower"->42.5,"tupper"->55,"replower"->0.6,"repupper"->0.65,"powlower"->1.8,"powupper"->2.5|>,
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
  "MA"-><| "rlower"->4.85,"rupper"->5,"tlower"->46.5,"tupper"-> 53,"replower"->0.6,"repupper"->0.7,"powlower"->1.45,"powupper"->1.65|>,
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

  (* TODO we should move this ParametricNDSolve and NonlinearModelFit into a separate "model fit" function *)
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

  (* Echo out some info on how good the fits are / show the plots *)
  Echo[gofMetrics];
  Echo[fitPlots[state, longData, evaluateSolution, fit, fitParams]];

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
      (* generate a json for the parameter values with some additional metadata for the site *)
      "parameters"->getExpectedParameters[fitParams, params, numberOfSimulations]
    }, First];

  (* plot hospitalization against the predicted curves *)
  Echo[plotStateHospitalization[output, state]];

  output
]


(* the main utility for generating fits / simulations for each state. pass a simulation count to the first
argument and an array of two letter state code strings to the second *)
(* this will write JSON out to the respective state files and the change can be previewd on localhost:3000
when running the web server *)
GenerateModelExport[simulationsPerCombo_:1000, states_:statesToRun] := Module[{days},
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
