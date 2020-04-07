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
