dateticks = {
	{0, Rotate["Jan",\[Pi]/2]},
		{(31),""},
		{(31+28),""},
		{(31+28+31),Rotate["Apr",\[Pi]/2]},
		{(31+28+31+30),""},
		{(31+28+31+30+31),""},
		{(31+28+31+30+31+30),Rotate["July",\[Pi]/2]},
		{(31+28+31+30+31+30+31),""},
		{(31+28+31+30+31+30+31+31),""},
		{(31+28+31+30+31+30+31+31+30),Rotate["Oct",\[Pi]/2]},
		{(31+28+31+30+31+30+31+31+30+31),""},
		{(31+28+31+30+31+30+31+31+30+31+30),""},
		{365,Rotate["Jan",\[Pi]/2]},{365+(31),""},
		{365+(31+28),""},
		{365+(31+28+31),Rotate["Apr",\[Pi]/2]},
		{365+(31+28+31+30),""},
		{365+(31+28+31+30+31),""},
		{365+(31+28+31+30+31+30),Rotate["July",\[Pi]/2]},
		{365+(31+28+31+30+31+30+31),""},
		{365+(31+28+31+30+31+30+31+31),""},
		{365+(31+28+31+30+31+30+31+31+30),Rotate["Oct",\[Pi]/2]},
		{365+(31+28+31+30+31+30+31+31+30+31),""},
		{365+(31+28+31+30+31+30+31+31+30+31+30),""},
		{365*2,Rotate["Jan",\[Pi]/2]},{365*2+(31),""},
		{365*2+(31+28),""},
		{365*2+(31+28+31),Rotate["Apr",\[Pi]/2]},
		{365*2+(31+28+31+30),""},
		{365*2+(31+28+31+30+31),""},
		{365*2+(31+28+31+30+31+30),Rotate["July",\[Pi]/2]},
		{365*2+(31+28+31+30+31+30+31),""},
		{365*2+(31+28+31+30+31+30+31+31),""},
		{365*2+(31+28+31+30+31+30+31+31+30),Rotate["Oct",\[Pi]/2]}};
		
containedText=Text[Framed[Style["Virus Contained",FontSize->24,Bold,Black,FontFamily->"Calibri"],Background->Green,ContentPadding->False]];
containedGraphics=Graphics[containedText,ImageSize->Rasterize[containedText,"RasterSize"]];
heardText=Text[Framed[Style["Herd Immunity Developed",FontSize->24,Bold,Black,FontFamily->"Calibri"],Background->Red,ContentPadding->False]];
heardGraphics=Graphics[heardText,ImageSize->Rasterize[heardText,"RasterSize"]];
icuBelowCapacity=Text[Framed[Style["ICU Below Capacity",FontSize->24,Bold,Black,FontFamily->"Calibri"],Background->Green,ContentPadding->False]];
icuBelowCapacityGraphics=Graphics[icuBelowCapacity,ImageSize->Rasterize[icuBelowCapacity,"RasterSize"]];
icuOvershotText=Text[Framed[Style["ICU Capacity Overshot",FontSize->24,Bold,Black,FontFamily->"Calibri"],Background->Red,ContentPadding->False]];
icuOvershotTextGraphics=Graphics[icuOvershotText,ImageSize->Rasterize[icuOvershotText,"RasterSize"]];


stateHistoryHelper=StringTemplate["\"`state`\"-><|\"scenario1\"->{{`baseline`/100,t<69},{`d69`/100,69<=t<70},{`d70`/100,70<=t<71},{`d71`/100,71<=t<72},{`d72`/100,72<=t<73},{`d73`/100,73<=t<74},{`d74`/100,74<=t<75},{`d75`/100,75<=t<76},{`d76`/100,76<=t<77},{`d77`/100,77<=t<78},{`d78`/100,78<=t<79},{`d79`/100,79<=t<80},{`d80`/100,80<=t<81},{`d81`/100,81<=t<82},{`d81`/100,82<=t<175},{`baseline`/100,175<=t<=tmax}},
      \"scenario2\"->{{`baseline`/100,t<69},{`d69`/100,t<=69},{`d70`/100,70<=t<71},{`d71`/100,71<=t<72},{`d72`/100,72<=t<73},{`d73`/100,73<=t<74},{`d74`/100,74<=t<75},{`d75`/100,75<=t<76},{`d76`/100,76<=t<77},{`d77`/100,77<=t<78},{`d78`/100,78<=t<79},{`d79`/100,79<=t<80},{`d80`/100,80<=t<81},{`d81`/100,81<=t<82},{`d81`/100,82<=t<87},{40/100,87<=t<175},{`baseline`/100,175<=t<=tmax}},
      \"scenario3\"->{{`baseline`/100,t<69},{`d69`/100,t<=69},{`d70`/100,70<=t<71},{`d71`/100,71<=t<72},{`d72`/100,72<=t<73},{`d73`/100,73<=t<74},{`d74`/100,74<=t<75},{`d75`/100,75<=t<76},{`d76`/100,76<=t<77},{`d77`/100,77<=t<78},{`d78`/100,78<=t<79},{`d79`/100,79<=t<80},{`d80`/100,80<=t<81},{`d81`/100,81<=t<82},{`d81`/100,82<=t<87},{11/100,87<=t<145},{`baseline`/100,145<=t<=tmax}},
      \"scenario4\"->{{`baseline`/100,t<69},{`d69`/100,t<=69},{`d70`/100,70<=t<71},{`d71`/100,71<=t<72},{`d72`/100,72<=t<73},{`d73`/100,73<=t<74},{`d74`/100,74<=t<75},{`d75`/100,75<=t<76},{`d76`/100,76<=t<77},{`d77`/100,77<=t<78},{`d78`/100,78<=t<79},{`d79`/100,79<=t<80},{`d80`/100,80<=t<81},{`d81`/100,81<=t<82},{`d81`/100,82<=t<87},{`baseline`/100,87<=t<=tmax}}|>"][#]&/@stateDistancingData;
