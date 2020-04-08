(* ::Package:: *)

rmsRelativeError[residuals_,longData_,mask_:{}]:=If[
  Length[mask]==0,
  Mean[(residuals/longData[[All,3]])^2]^.5,
  rmsRelativeError[
    Pick[residuals,mask],
    Pick[longData,mask]]];
meanRelativeError[residuals_,longData_,mask_:{}]:=If[
  Length[mask]==0,
  Mean[residuals/longData[[All,3]]],
  meanRelativeError[
    Pick[residuals,mask],
    Pick[longData,mask]]];
chiSquared[residuals_,longData_,mask_:{}]:=If[
  Length[mask]==0,
  Mean[residuals^2/longData[[All,3]]],
  chiSquared[
    Pick[residuals,mask],
    Pick[longData,mask]]];
rSquared[residuals_,longData_,mask_:{}]:=If[
  Length[mask]==0,
  Total[residuals^2]/Total[(#-Mean[#])^2]&[longData[[All,3]]],
  rSquared[
    Pick[residuals,mask],
    Pick[longData,mask]]];


goodnessOfFitMetrics[residuals_,longData_,population_]:=Module[{RmsRelativeError,MeanRelativeError,ChiSquared,RSquared,deathsMask,positivePcrMask,deathDataLength},
  deathsMask=(#[[1]]==1)&/@longData;
  positivePcrMask=(#[[1]]==2)&/@longData;
  deathDataLength=Length[Select[longData,#[[1]]==1&]];
  <|
    "chiSquared"->chiSquared[residuals,longData],
    "rmsRelativeError"->rmsRelativeError[residuals,longData],
    "rmsRelativeErrorDeaths"->rmsRelativeError[residuals,longData,deathsMask],
    "rmsRelativeErrorPcr"->rmsRelativeError[residuals,longData,positivePcrMask],
    "meanRelativeErrorDeaths"->meanRelativeError[residuals,longData,deathsMask],
    "meanRelativeErrorPcr"->meanRelativeError[residuals,longData,positivePcrMask],
    "rSquaredDeaths"->rSquared[residuals,longData,deathsMask],
    "rSquaredPcr"->rSquared[residuals,longData,positivePcrMask],
    "deathResidual7Day"->population*#[[2]]&/@Thread[{#2,#1}&[
        residuals[[1;;deathDataLength]],
        (#[[2]]&/@longData[[1;;deathDataLength]]),
        (#[[3]]&/@longData[[1;;deathDataLength]])
      ]][[-7;;]],
    "pcrResidual7Day"->population*#[[2]]&/@Thread[{#2,#1}&[
        residuals[[deathDataLength+1;;Length[longData]]],
        Reverse[(#[[2]]&/@longData[[deathDataLength+1;;Length[longData]]])],
        Reverse[(#[[3]]&/@longData[[deathDataLength+1;;Length[longData]]])]
      ]][[-7;;]]
  |>/.InterpolatingFunction[___]->((0)&)
];


exportAllStatesGoodnessOfFitMetricsCsv[file_,allStateData_]:=Module[{columnOrder,gofAssociationToArray,csvData},
  columnOrder={
    "chiSquared",
    "rmsRelativeError",
    "rmsRelativeErrorDeaths",
    "rmsRelativeErrorPcr",
    "meanRelativeErrorDeaths",
    "meanRelativeErrorPcr",
    "rSquaredDeaths",
    "rSquaredPcr",
    "deathResidual7Day",
    "pcrResidual7Day"};
  gofAssociationToArray[gofMetrics_]:=Map[gofMetrics[#]&,columnOrder];
  csvData=Join[
    {Join[{"state"},columnOrder]},
    Sort[
      KeyValueMap[
        Join[{#1},gofAssociationToArray[#2["goodnessOfFitMetrics"]]]&,
        allStateData],
      (AlphabeticOrder[First[#1],First[#2]])&]];
  Export[file,csvData,"CSV"];
  csvData
]


exportAllStatesGoodnessOfFitMetricsSvg[file_,allStateData_]:=Module[{n,data,plot,domain},
  n=Length[allStateData];
  data=KeyValueMap[{
      #1,
      #2["goodnessOfFitMetrics"]["meanRelativeErrorDeaths"],
      #2["goodnessOfFitMetrics"]["rmsRelativeErrorDeaths"],
      #2["goodnessOfFitMetrics"]["meanRelativeErrorPcr"],
      #2["goodnessOfFitMetrics"]["rmsRelativeErrorPcr"]}&,
    allStateData];
  data=Sort[data,(AlphabeticOrder[First[#1],First[#2]])&];
  data=MapIndexed[Join[n+1-#2,#1]&,data];
  domain=Max[
    data[[All,3]]+data[[All,4]],
    data[[All,5]]+data[[All,6]],
    Abs[data[[All,3]]-data[[All,4]]],
    Abs[data[[All,5]]-data[[All,6]]]];
  plot=ListPlot[
    {
      Map[{Around[#[[3]],#[[4]]],#[[1]]+.1}&,data],
      Map[{Around[#[[5]],#[[6]]],#[[1]]-.1}&,data]},
    Ticks->{Automatic,data[[All,{1,2}]]},
    PlotLegends->Placed[{"Deaths","Positive tests"},Below],
    PlotLabel->"Mean and RMS relative error",
    PlotRange->{{-domain,domain},{0,n+1}},
    PlotStyle->{{RGBColor["#88bbfe"]},{RGBColor["#aff1b6"]}},
    AspectRatio->n/12/GoldenRatio,
    ImageSize->400];
  Export[file, plot, "SVG"];
  plot
];


exportAllStatesGoodnessOfFitMetricsSvg[file_,allStateData_]:=Module[{n,data,plot,domain},
  n=Length[allStateData];
  data=KeyValueMap[{
      #1,
      #2["goodnessOfFitMetrics"]["meanRelativeErrorDeaths"],
      #2["goodnessOfFitMetrics"]["rmsRelativeErrorDeaths"],
      #2["goodnessOfFitMetrics"]["meanRelativeErrorPcr"],
      #2["goodnessOfFitMetrics"]["rmsRelativeErrorPcr"]}&,
    allStateData];
  data=Sort[data,(AlphabeticOrder[First[#1],First[#2]])&];
  data=MapIndexed[Join[n+1-#2,#1]&,data];
  domain=Max[
    data[[All,3]]+data[[All,4]],
    data[[All,5]]+data[[All,6]],
    Abs[data[[All,3]]-data[[All,4]]],
    Abs[data[[All,5]]-data[[All,6]]]];
  plot=ListPlot[
    {
      Map[{Around[#[[3]],#[[4]]],#[[1]]+.1}&,data],
      Map[{Around[#[[5]],#[[6]]],#[[1]]-.1}&,data]},
    Ticks->{Automatic,data[[All,{1,2}]]},
    PlotLegends->Placed[{"Deaths","Positive tests"},Below],
    PlotLabel->"Mean and RMS relative error",
    PlotRange->{{-domain,domain},{0,n+1}},
    PlotStyle->{{RGBColor["#88bbfe"]},{RGBColor["#aff1b6"]}},
    AspectRatio->n/12/GoldenRatio,
    ImageSize->400];
  Export[file, plot, "SVG"];
  plot
];


plotStateHospitalization[stateData_, state_]:=Module[{hospcurrent, hospcumulative, icucurrent, icucumulative},

  hospcurrent={#["day"],#["currentlyReportedHospitalized"]["confirmed"],#["currentlyReportedHospitalized"]["expected"]}&/@stateData["scenarios"]["scenario1"]["timeSeriesData"];
  hospcumulative={#["day"],#["cumulativeReportedHospitalized"]["confirmed"],#["cumulativeReportedHospitalized"]["expected"]}&/@stateData["scenarios"]["scenario1"]["timeSeriesData"];
  icucurrent={#["day"],#["currentlyCritical"]["confirmed"],#["currentlyCritical"]["expected"]}&/@stateData["scenarios"]["scenario1"]["timeSeriesData"];
  icucumulative={#["day"],#["cumulativeCritical"]["confirmed"],#["cumulativeCritical"]["expected"]}&/@stateData["scenarios"]["scenario1"]["timeSeriesData"];

  Column[{
      Row[{
          Column[{
              Text["Current Hospitalizations for "<>state],
              Show[
                ListPlot[Select[{#[[1]],#[[2]]}&/@hospcurrent, #[[2]]>0&],PlotStyle->Red, ImageSize->250],
                ListLinePlot[{#[[1]],#[[3]]}&/@hospcurrent, ImageSize->300]
              ]
            }],
          Column[{
              Text["Cumulative Hospitalizations for "<>state],
              Show[
                ListPlot[Select[{#[[1]],#[[2]]}&/@hospcumulative, #[[2]]>0&],PlotStyle->Red, ImageSize->250],
                ListLinePlot[{#[[1]],#[[3]]}&/@hospcumulative, ImageSize->300]
              ]
            }],
          Column[{
              Text["Current ICU for "<>state],
              Show[
                ListPlot[Select[{#[[1]],#[[2]]}&/@icucurrent, #[[2]]>0&],PlotStyle->Red, ImageSize->250],
                ListLinePlot[{#[[1]],#[[3]]}&/@icucurrent, ImageSize->300]
              ]
            }],
          Column[{
              Text["Cumulative ICU for "<>state],
              Show[
                ListPlot[Select[{#[[1]],#[[2]]}&/@icucumulative, #[[2]]>0&],PlotStyle->Red, ImageSize->250],
                ListLinePlot[{#[[1]],#[[3]]}&/@icucumulative, ImageSize->300]
              ]
            }]
            }]
    }]

];


exportAllStatesHospitalizationGoodnessOfFitMetricsSvg[file_,allStatesData_]:=Module[{
    states,
    cumulativeStates,
    currentStates,
    processState,
    n,
    currentData,
    currentX,
    currentY,
    cumulativeData,
    cumulativeX,
    cumulativeY,
    currentXH,
    currentYH,
    currentXI,
    currentYI,
    cumulativeXH,
    cumulativeYH,
    cumulativeXI,
    cumulativeYI,
    data,
  allData,
currentHData,
cumHData,
plot,
currentIData,
cumIData,
    domainCurrH,
    domainCurrI,
    domainCumH,
      currentHStates,
  cumulativeHStates,
  currentIStates,
  cumulativeIStates,
    domainCumI},


  states=Sort[Keys[allStatesData], AlphabeticOrder];


  processState[state_]:=Module[{icucurrent, hospcumulative, hospcurrent,icucumulative,hascurrhosp,hascumhosp,hascurricu,hascumicu},
    hospcurrent=Select[{#["day"],#["currentlyReportedHospitalized"]["confirmed"],#["currentlyReportedHospitalized"]["expected"]}&/@allStatesData[state]["scenarios"]["scenario1"]["timeSeriesData"],#[[2]]>0&];
    hospcumulative=Select[{#["day"],#["cumulativeReportedHospitalized"]["confirmed"],#["cumulativeReportedHospitalized"]["expected"]}&/@allStatesData[state]["scenarios"]["scenario1"]["timeSeriesData"],#[[2]]>0&];
    icucurrent=Select[{#["day"],#["currentlyCritical"]["confirmed"],#["currentlyCritical"]["expected"]}&/@allStatesData[state]["scenarios"]["scenario1"]["timeSeriesData"],#[[2]]>0&];
    icucumulative=Select[{#["day"],#["cumulativeCritical"]["confirmed"],#["cumulativeCritical"]["expected"]}&/@allStatesData[state]["scenarios"]["scenario1"]["timeSeriesData"],#[[2]]>0&];
    
    hascurrhosp=Length[Select[hospcurrent,#[[2]]>0&]]>0;
    hascumhosp=Length[Select[hospcumulative,#[[2]]>0&]]>0;
    hascurricu=Length[Select[icucurrent,#[[2]]>0&]]>0;
    hascumicu=Length[Select[icucumulative,#[[2]]>0&]]>0;

    <|
      "state"->state,
      "meanRelativeErrorCurrentlyReportedHospitalized"->If[hascurrhosp,Mean[Map[#[[3]]-#[[2]]&,hospcurrent]],0],
      "rmsRelativeErrorCurrentlyReportedHospitalized"->If[hascurrhosp,Sqrt[Mean[Map[(#[[3]]-#[[2]])^2&,hospcurrent]]],0],
      "meanRelativeErrorCumulativeReportedHospitalized"->If[hascumhosp,Mean[Map[#[[3]]-#[[2]]&,hospcumulative]],0],
      "rmsRelativeErrorCumulativeReportedHospitalized"->If[hascumhosp,Sqrt[Mean[Map[(#[[3]]-#[[2]])^2&,hospcumulative]]],0],
      "meanRelativeErrorCurrentlyCritical"->If[hascurricu,Mean[Map[#[[3]]-#[[2]]&,icucurrent]],0],
      "rmsRelativeErrorCurrentlyCritical"->If[hascurricu,Sqrt[Mean[Map[(#[[3]]-#[[2]])^2&,icucurrent]]],0],
      "meanRelativeErrorCumulativeCritical"->If[hascumicu,Mean[Map[#[[3]]-#[[2]]&,icucumulative]],0],
      "rmsRelativeErrorCumulativeCritical"->If[hascumicu,Sqrt[Mean[Map[(#[[3]]-#[[2]])^2&,icucumulative]]],0]
    |>
  ];
  

  n = Length[states];
  allData=Map[processState,states];
  
  currentHData = Select[allData,#["meanRelativeErrorCurrentlyReportedHospitalized"]!=0&];
  cumHData = Select[allData,#["meanRelativeErrorCumulativeReportedHospitalized"]!=0&];
  currentIData = Select[allData,#["meanRelativeErrorCurrentlyCritical"]!=0&];
  cumIData = Select[allData,#["meanRelativeErrorCumulativeCritical"]!=0&];
  currentHStates = #["state"]&/@currentHData;
  cumulativeHStates = #["state"]&/@cumHData;
  currentIStates = #["state"]&/@currentIData;
  cumulativeIStates = #["state"]&/@cumIData;
  
  currentXH = Map[Around[#["meanRelativeErrorCurrentlyReportedHospitalized"],#["rmsRelativeErrorCurrentlyReportedHospitalized"]]&,currentHData];
  currentYH = Range[Length[currentHData]];
  cumulativeXH = Map[Around[#["meanRelativeErrorCumulativeReportedHospitalized"],#["rmsRelativeErrorCumulativeReportedHospitalized"]]&,cumHData];
  cumulativeYH = Range[Length[cumHData]];
  currentXI = Map[Around[#["meanRelativeErrorCurrentlyCritical"],#["rmsRelativeErrorCurrentlyCritical"]]&,currentIData];
  currentYI = Range[Length[currentIData]];
  cumulativeXI = Map[Around[#["meanRelativeErrorCumulativeCritical"],#["rmsRelativeErrorCumulativeCritical"]]&,cumIData];
  cumulativeYI = Range[Length[cumIData]];

  plot=
  Grid[Partition[{
        Column[{
            Text["Currently Hospitalized"],
            ListPlot[{
                Transpose[{currentXH,currentYH}]
              },
              Ticks->{
                Automatic,
                MapThread[{#1,#2}&,{Range[Length[currentHData],1,-1],currentHStates}]},
              PlotLegends->Placed[{"Current"},Below],
              PlotLabel->"Mean and RMS relative error",
              PlotStyle->{RGBColor["#88bbfe"],RGBColor["#aff1b6"]},
              AspectRatio->n/12/GoldenRatio,
              ImageSize->400]
          }],
        Column[{
            Text["Cumulative Hospitalized"],
            ListPlot[{
                Transpose[{cumulativeXH,cumulativeYH}]
              },
              Ticks->{
                Automatic,
                MapThread[{#1,#2}&,{Range[Length[cumHData],1,-1],cumulativeHStates}]},
              PlotLegends->Placed[{"Cumulative"},Below],
              PlotLabel->"Mean and RMS relative error",
              PlotStyle->{RGBColor["#88bbfe"],RGBColor["#aff1b6"]},
              AspectRatio->n/12/GoldenRatio,
              ImageSize->400]
          }],
        Column[{
            Text["Currently ICU"],
            ListPlot[{
                Transpose[{currentXI,currentYI}]
              },
              Ticks->{
                Automatic,
                MapThread[{#1,#2}&,{Range[Length[currentIData],1,-1],currentIStates}]},
              PlotLegends->Placed[{"Current"},Below],
              PlotLabel->"Mean and RMS relative error",
              PlotStyle->{RGBColor["#88bbfe"],RGBColor["#aff1b6"]},
              AspectRatio->n/12/GoldenRatio,
              ImageSize->400]
          }],
        Column[{
            Text["Cumulative ICU"],
            ListPlot[{
                Transpose[{cumulativeXI,cumulativeYI}]
              },
              Ticks->{
                Automatic,
                MapThread[{#1,#2}&,{Range[Length[cumIData],1,-1],cumulativeIStates}]},
              PlotLegends->Placed[{"Cumulative"},Below],
              PlotLabel->"Mean and RMS relative error",
              PlotStyle->{RGBColor["#88bbfe"],RGBColor["#aff1b6"]},
              AspectRatio->n/12/GoldenRatio,
              ImageSize->400]
          }]}
      ,4]];
  Export[file, plot, "SVG"];
  Echo[plot];
  plot
];
