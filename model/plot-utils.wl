(* ::Package:: *)

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
