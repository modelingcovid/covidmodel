(* ::Package:: *)

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
