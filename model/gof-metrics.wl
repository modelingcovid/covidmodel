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


goodnessOfFitMetrics[residuals_,longData_]:=Module[{deathsMask,positivePcrMask},
	deathsMask=(#[[1]]==1)&/@longData;
	positivePcrMask=(#[[1]]==2)&/@longData;
	<|
		"chiSquared"->chiSquared[residuals,longData],
		"rmsRelativeError"->rmsRelativeError[residuals,longData],
		"rmsRelativeErrorDeaths"->rmsRelativeError[residuals,longData,deathsMask],
		"rmsRelativeErrorPcr"->rmsRelativeError[residuals,longData,positivePcrMask],
		"meanRelativeErrorDeaths"->meanRelativeError[residuals,longData,deathsMask],
		"meanRelativeErrorPcr"->meanRelativeError[residuals,longData,positivePcrMask],
		"rSquaredDeaths"->rSquared[residuals,longData,deathsMask],
		"rSquaredPcr"->rSquared[residuals,longData,positivePcrMask]
	|>
];


exportAllStatesGoodnessOfFitMetricsCsv[file_,allStateData_]:=Module[{columnOrder,gofAssociationToArray},
	columnOrder={"chiSquared",
		"rmsRelativeError",
		"rmsRelativeErrorDeaths",
		"rmsRelativeErrorPcr",
		"meanRelativeErrorDeaths",
		"meanRelativeErrorPcr",
		"rSquaredDeaths",
		"rSquaredPcr"};
	gofAssociationToArray[gofMetrics_]:=Map[gofMetrics[#]&,columnOrder];
	Export[
		file,
		Join[
			{Join[{"state"},columnOrder]},
			KeyValueMap[Join[#1,gofAssociationToArray[#2]]&,allStateData]],
		"CSV"];
]


exportAllStatesGoodnessOfFitMetricsSvg[file_,allStateData_]:=Module[{data},
	data=MapIndexed[
		Join[#2,#1]&,
		Sort[KeyValueMap[{
				#1,
				Around[
					#2["goodnessOfFitMetrics"]["meanRelativeErrorDeaths"],
					#2["goodnessOfFitMetrics"]["rmsRelativeErrorDeaths"]],
				Around[
					#2["goodnessOfFitMetrics"]["meanRelativeErrorPcr"],
					#2["goodnessOfFitMetrics"]["rmsRelativeErrorPcr"]]}&,
			allStateData]]];
	Export[
		file,
		Show[
			ListPlot[data[[All,{1,3}]]-.1,Ticks->{data[[All,{1,2}]],Automatic},PlotRange->{{.5,Length[data]+.5},{-1.2,1.2}},PlotStyle->{RGBColor["#88bbfe"]}],
			ListPlot[data[[All,{1,4}]]+.1,PlotStyle->{RGBColor["#aff1b6"]}]],
		"SVG"
	];
]
