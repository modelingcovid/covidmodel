(* ::Package:: *)

Autoindent[file_]:=Module[{
    openers,
    closers,
    rawText,
    commentsAndStrings,
    removeCommentsAndStrings,
    insertCommentsAndStrings,
    lines,
    openCount,
    closeCount,
    closeAtStart,
    closeAtStartCount,
    indents},
  rawText=Import[file,"Text"];

  commentsAndStrings=StringCases[rawText,RegularExpression["\\(\\*+([^*)]|\\*[^)]|[^*]\\))*\\*+\\)|\"([^\"\\\\]|\\\\.)*\""]];
  removeCommentsAndStrings=MapIndexed[#1->"<<<<"<>ToString[First[#2]]<>">>>>"&,commentsAndStrings];
  insertCommentsAndStrings=MapIndexed["<<<<"<>ToString[First[#2]]<>">>>>"->#1&,commentsAndStrings];
  rawText = StringReplace[rawText,removeCommentsAndStrings];

  lines=Map[StringTrim,StringSplit[rawText,EndOfLine]];

  openers={"(","[","{","<|","\[LeftDoubleBracket]"};
  closers={")","]","}","|>","\[RightDoubleBracket]"};
  openCount=StringCount[lines,openers];
  closeCount=StringCount[lines,closers];

  closeAtStart=Map[
    If[Length[#]>0,First[#],""]&,
    Map[
      StringCases[
        StringReplace[#,Whitespace->""],
        StartOfString~~closers..]&,
      lines]];
  closeAtStartCount=StringCount[closeAtStart,closers];

  indents=Join[{0},Accumulate[openCount-closeCount][[;;-2]]]-closeAtStartCount;

  rawText=StringJoin[MapThread[StringJoin[ConstantArray["  ", If[StringLength[#2]>0,#1,0]],#2,"\n"]&,{indents,lines}]];
  rawText=StringReplace[rawText,insertCommentsAndStrings];
  Export[file,rawText,"Text"];
];
