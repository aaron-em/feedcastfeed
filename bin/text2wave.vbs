Randomize

Set spVoice = CreateObject("SAPI.SpVoice")
Set spVoice.Voice = spVoice.GetVoices.Item(0)
spVoice.Volume = 100
spVoice.Rate   = 0
' spVoice.Pitch  = 0

Set FSO = CreateObject("Scripting.FileSystemObject")
TempFileName = FSO.GetSpecialFolder(2) & "\text2wave-" & Rnd & ".wav"
WScript.StdOut.WriteLine(TempFileName)

Set spFileStream = CreateObject("SAPI.SpFileStream")
spFileStream.Format.Type = 35
spFileStream.Open TempFileName, 3, False
Set spVoice.AudioOutputStream = spFileStream

InputText = ""
Do While Not WScript.StdIn.AtEndOfStream
        InputText = InputText + WScript.StdIn.ReadAll()
Loop

spVoice.Speak InputText
