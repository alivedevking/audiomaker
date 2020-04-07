class AudioMaker {
  constructor(config) {
      config = config || {};
      this.aContext = this._getContext();
      this.sampleRate = this.aContext.sampleRate;
      this.outputType = config.type || 'wav';
    }
  
  _getContext () {
      window.AudioContext =
        window.AudioContext ||
        window.webkitAudioContext ||
        window.mozAudioContext;
      return new AudioContext();
  };

  _getArrayBuffer (data) {
    let bufferRequest;
    if(data && data instanceof Blob) {
      bufferRequest = data.arrayBuffer();
    } else {
      bufferRequest = fetch(data,{mode: 'no-cors'}).then((res)=>{
        return res.arrayBuffer();
      });
    }
    return bufferRequest;
  }

  trim (data,sTime,eTime) {
    return new Promise(async(resolve)=>{
      let _self = this;
      _self._getArrayBuffer(data).then(async(arrayBuffer)=>{
        await _self.aContext.decodeAudioData(arrayBuffer).then((decodedData)=>{
          let trimmedData,
              trimStart = decodedData.sampleRate*sTime,
              trimEnd = eTime ? decodedData.sampleRate*eTime : decodedData.sampleRate*decodedData.duration;
          if (decodedData.numberOfChannels === 2) {
            trimmedData = _self.interleave(decodedData.getChannelData(0).slice(trimStart,trimEnd), decodedData.getChannelData(1).slice(trimStart,trimEnd));
          } else {
            trimmedData = decodedData.getChannelData(0).slice(trimStart,trimEnd);
          }
          resolve(_self._exportAudio(trimmedData,decodedData.numberOfChannels));
        });
      });
    });
  }

  add (data) {
    return new Promise(async(resolve)=>{
      let _self = this;
      let arrayBuffers = data.map(async(audio)=>{
        return await _self._getArrayBuffer(audio).then((arrayBuffer)=>{
          return _self.aContext.decodeAudioData(arrayBuffer);
        });
      });
      Promise.all(arrayBuffers).then((audioBuffers)=>{
        let floatData = [];
        audioBuffers.forEach((decodedData)=>{
          if (decodedData.numberOfChannels === 2) {
            floatData.push(Array.from(_self.interleave(decodedData.getChannelData(0), decodedData.getChannelData(1))));
          } else {
            floatData.push(Array.from(decodedData.getChannelData(0)));
          }
        });
        let concatinatedArray = floatData.flat();
        resolve(_self._exportAudio(new Float32Array(concatinatedArray),audioBuffers[0].numberOfChannels));
      });
    });
  }

  merge (data) {
    return new Promise(async(resolve)=>{
      let _self = this;
      let arrayBuffers = data.map(async(audio)=>{
        return await _self._getArrayBuffer(audio).then((arrayBuffer)=>{
          return _self.aContext.decodeAudioData(arrayBuffer);
        });
      });
      Promise.all(arrayBuffers).then((audioBuffers)=>{
        let maxChannels = Math.max(...audioBuffers.map(o => o.numberOfChannels), 0);
        let maxDuration = Math.max(...audioBuffers.map(o => o.duration), 0);      
        var mixedBuffer = _self.aContext.createBuffer(maxChannels, _self.aContext.sampleRate * maxDuration, _self.aContext.sampleRate);        
        audioBuffers.forEach((buffer)=>{
          for (var srcChannel = 0; srcChannel < buffer.numberOfChannels; srcChannel++) {
            var _out = mixedBuffer.getChannelData(srcChannel);
            var _in = buffer.getChannelData(srcChannel);
            for (var i = 0; i < _in.length; i++) {
                _out[i] += _in[i];
            }
          }
        });
        let floatData;
        if (maxChannels === 2) {
          floatData = _self.interleave(mixedBuffer.getChannelData(0), mixedBuffer.getChannelData(1));
        } else {
          floatData = mixedBuffer.getChannelData(0);
        }
        resolve(_self._exportAudio(floatData,maxChannels));
      });
    });
  }

  loop (data,loopCount=0) {
    return new Promise(async(resolve)=>{
      let _self = this,loopedArray = [];
      let audioBuffer = await _self._getArrayBuffer(data).then((arrayBuffer)=>{
        return _self.aContext.decodeAudioData(arrayBuffer);
      });
      for(let i=0;i<=loopCount;i++) {
        if (audioBuffer.numberOfChannels === 2) {
          loopedArray.push(Array.from(_self.interleave(audioBuffer.getChannelData(0), audioBuffer.getChannelData(1))));
        } else {
          loopedArray.push(Array.from(audioBuffer.getChannelData(0)));
        }
      }
      resolve(_self._exportAudio(new Float32Array(loopedArray.flat()),audioBuffer.numberOfChannels));
    });
  }

  reverse (data) {
    return new Promise(async(resolve)=>{
      let _self = this,reversedData = [];
      let audioBuffer = await _self._getArrayBuffer(data).then((arrayBuffer)=>{
        return _self.aContext.decodeAudioData(arrayBuffer);
      });
      if (audioBuffer.numberOfChannels === 2) {
        reversedData = Array.from(_self.interleave(audioBuffer.getChannelData(0), audioBuffer.getChannelData(1))).reverse();
      } else {
        reversedData = Array.from(audioBuffer.getChannelData(0)).reverse();
      }
      resolve(_self._exportAudio(new Float32Array(reversedData),audioBuffer.numberOfChannels));
    });
  }

  timeline (data) {
    return new Promise(async(resolve)=>{
      let _self = this, timelineData = [...data], resultArray = [];
      let audioTimelineLoop = (i) => {
        let modifedArray;
        _self._getArrayBuffer(timelineData[i].audio).then((arrayBuffer)=>{
          _self.aContext.decodeAudioData(arrayBuffer).then((audioBuffer)=>{
            timelineData[i].audioBuffer = audioBuffer;
            if(timelineData[i].trim && timelineData[i].trim instanceof Array) {
              let sTime = timelineData[i].trim[0],
                  eTime = timelineData[i].trim[1] ? timelineData[i].trim[1] : audioBuffer.duration;
              if (audioBuffer.numberOfChannels === 2) {
                modifedArray = Array.from(_self.interleave(audioBuffer.getChannelData(0).slice(audioBuffer.sampleRate*sTime, audioBuffer.sampleRate*eTime),  audioBuffer.getChannelData(1).slice(audioBuffer.sampleRate*sTime, audioBuffer.sampleRate*eTime)));
              } else {
                modifedArray = Array.from(audioBuffer.getChannelData(0).slice(audioBuffer.sampleRate*sTime, audioBuffer.sampleRate*(eTime)));
              }
            } else {
              if (audioBuffer.numberOfChannels === 2) {
                modifedArray = Array.from(_self.interleave(audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)));
              } else {
                modifedArray = Array.from(audioBuffer.getChannelData(0));
              }
            }
            if(timelineData[i].reverse) {
              modifedArray = modifedArray.reverse();
            }
            if(timelineData[i].loop && (typeof timelineData[i].loop == 'number')) {
              for(let j=0;j<timelineData[i].loop;j++) {
                modifedArray.push(modifedArray);
              }
            }
            timelineData[i].modifedArray = modifedArray.flat();
            resultArray.push(timelineData[i].modifedArray);
            if(timelineData.length === resultArray.length) {
              let maxChannels = Math.max(...timelineData.map(o => o.audioBuffer.numberOfChannels), 0);
              resolve(_self._exportAudio(new Float32Array(resultArray.flat()),maxChannels));
            } else {
              modifedArray = null;
              audioTimelineLoop(i+1);
            }
          });
        });
      }
      audioTimelineLoop(0);
    });
  };

  _exportAudio (samplesData,numberOfChannels) {
    let _self = this,arrayBuffer,blob;
    if(_self.outputType == 'wav') {
      let format = 3,
          bitDepth = 32;
      arrayBuffer = _self.encodeWAV(samplesData,format,_self.sampleRate,numberOfChannels,bitDepth);
      blob = new Blob([new Uint8Array(arrayBuffer)],{type: 'audio/wav'});
    } 
    return blob;
  };

  interleave (inputL, inputR) {
    let length = inputL.length + inputR.length,
        result = new Float32Array(length),
        index = 0,
        inputIndex = 0;
    while (index < length) {
      result[index++] = inputL[inputIndex];
      result[index++] = inputR[inputIndex];
      inputIndex++;
    }
    return result;
  }

  writeString (view, offset, string) {
    for (var i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeFloat32 (output, offset, input) {
    for (var i = 0; i < input.length; i++, offset += 4) {
      output.setFloat32(offset, input[i], true);
    }
  }
  
  floatTo16BitPCM (output, offset, input) {
    for (var i = 0; i < input.length; i++, offset += 2) {
      var s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  encodeWAV (samples, format, sampleRate, numChannels, bitDepth) {
    let _self = this,
        bytesPerSample = bitDepth / 8,
        blockAlign = numChannels * bytesPerSample,
        buffer = new ArrayBuffer(44 + samples.length * bytesPerSample),
        view = new DataView(buffer);
    /* RIFF identifier */
    _self.writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * bytesPerSample, true);
    /* RIFF type */
    _self.writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    _self.writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, format, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * blockAlign, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, blockAlign, true);
    /* bits per sample */
    view.setUint16(34, bitDepth, true);
    /* data chunk identifier */
    _self.writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * bytesPerSample, true);
    _self.writeFloat32(view, 44, samples);
    return buffer;
  }

}

module.exports = AudioMaker;
