Set spVoice = CreateObject("SAPI.SpVoice")
For VoiceIndex = 0 To (spVoice.GetVoices.Count - 1)
        Set ThisVoice = spVoice.GetVoices.Item(VoiceIndex)
        WScript.Echo VoiceIndex & ": " & ThisVoice.GetDescription
Next