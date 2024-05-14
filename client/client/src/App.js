import React, { useEffect, useState } from 'react';
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
const effects = {

}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}


const url = "wss://e8c681f0b4ba40d78aad5ddb06840b9b.s1.eu.hivemq.cloud:8884/mqtt"
// Create an MQTT client instance
const options = {
  // Clean session
  clean: true,
  connectTimeout: 4000,
  // Authentication
  clientId: uuidv4(),
  username: 'emfmap',
  password: 'hA6H7AK&7J#fme#dmhe2',
}
const client = mqtt.connect(url, options)
client.on('connect', function () {
  console.log('Connected')
  // Subscribe to a topic
  client.subscribe('#', function (err) {
    if (!err) {
      // Publish a message to a topic
      client.publish('test', 'Hello mqtt')
    }
  })
})


function App() {
  const [layers_enabled, setLayers] = useState(["Background", "Structures", "Paths", "Villages"]);
  
  function changeValue(el, value) {
    if (el.target.checked) {
      client.publish('add', value)
      setLayers([
        ...layers_enabled,
        value
      ])
    } else {
      client.publish('remove', value)
      setLayers(
        layers_enabled.filter(a =>
          a !== value
        )
      );
    }
  }
  
  if(client.listeners('message').length==0){
    console.log("running effect")
    client.on('message', function (topic, message) {
      if (topic=="add") {
        setLayers([
          ...layers_enabled,
          message
        ])
      }
      if (topic=="remove") {
        setLayers(
          layers_enabled.filter(a =>
            a !== message
          )
        );
      }
      // message is Buffer
      console.log(message.toString())
    })
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
