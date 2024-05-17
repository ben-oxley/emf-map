import React, { useEffect, useState } from 'react';
import useMqtt from './useMqtt'
import mqtt from 'mqtt';
import logo from './logo.svg';
import './App.css';
const layers = {
  Background: "background_",
  Slope: "slope",
  Hillshade: "hillshade",
  "Aerial Imagery": "ortho",
  Structures: "structures_",
  Paths: "paths_",
  "Buried Services": "services_",
  Water: "site_water_",
  DKs: "dk_",
  "NOC-Physical": "noc_",
  Power: "power_",
  Lighting: "lighting_",
  Villages: "villages_"
};

const layerIDs = {
  A:"Aerial Imagery",
  B:"Background",
  Bu:"Buried Services",
  D:"DKs",
  H:"Hillshade",
  L:"Lighting",
  N:"NOC-Physical",
  P:"Paths",
  Po:"Power",
  S:"Slope",
  St:"Structures",
  V:"Villages",
  W:"Water"
}
const effects = {

}




function App() {
  const [layers_enabled, setLayers] = useState(["Background", "Structures", "Paths", "Villages"]);
  const { mqttSubscribe, mqttPublish, isConnected, payload } = useMqtt();

  useEffect(() => {
    Notification.requestPermission();
  }, []);
 
  useEffect(() => {
    if (isConnected) {
      mqttSubscribe('#');
    }
  }, [isConnected]);
 
  useEffect(() => {
    if (payload.message
      && ['add',"remove","state"].includes(payload.topic)
    ) {
      if (payload.topic=="add") {
        setLayers([
          ...layers_enabled,
          payload.message
        ])
      }
      if (payload.topic=="remove") {
        setLayers(
          layers_enabled.filter(a =>
            a !== payload.message
          )
        );
      }
      if (payload.topic=="state") {
        setLayers(
          payload.message.split(",").map(id=>layerIDs[id])
        );
      }
    }
  }, [payload]);
  


  function changeValue(el, value) {
    if (el.target.checked) {
      //mqttPublish('add', value)
      let layers = [
        ...layers_enabled,
        value
      ]
      setLayers(layers);
      let tags = layers.map(l=> Object.entries(layerIDs).filter(([k,v])=>v==l).map(([k,v])=>k)[0]).join(",")
      mqttPublish('state', tags)
    } else {
      //mqttPublish('remove', value)
      let layers = layers_enabled.filter(a =>
        a !== value
      )
      setLayers(layers);
      let tags = layers.map(l=> Object.entries(layerIDs).filter(([k,v])=>v==l).map(([k,v])=>k)[0]).join(",")
      mqttPublish('state', tags)
    }
  }
  

  

  return (
    <div className="App">
      {Object.keys(layers).map(function (object, i) {
        return <div className="form-control w-52" key={i}>
          <label className="cursor-pointer label">
            <span className="label-text">{object} </span>
            <input type="checkbox" className="toggle toggle-primary" onChange={(e) => changeValue(e, object)} checked={layers_enabled.includes(object)} />
          </label>
        </div>
      })}
    </div>
  );
}




export default App;
