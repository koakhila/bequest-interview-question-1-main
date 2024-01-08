import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";

const API_URL = "http://localhost:8080";

function App() {
  const [data, setData] = useState<string>();
  const [signature, setSignature] = useState<string>(); //signature to make sure data is not tampered

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try{
    const response = await fetch(API_URL);
    const { data, signature } = await response.json();

    if (verifyDataIntegrity(data, signature)){   //prior to state updating, we have to verify the data integrity
      setData(data);                             // set data
      setSignature(signature);                   // set signature
    }else{
      console.error("Failure of Data integrity verification");
      const recoverneeded = window.confirm("Verification of Data integrity failed. Do you want to recover the data?");
      if(recoverneeded){
        console.log("user wants to revover the data");
        //appropriate logic to recover data. There are many ways and this depends on how to recover data (not given in the program question)
        await recoverData();
      }else{
        console.log("User not willing to recover");
      }
    }
  }catch(error){
    console.error("Error fetching data:", error.message);
  }
    
  };
// code to recover data data if lost
  const recoverData = async () => {
    try {
      // from the backup source we can fetch the data
      const backupResponse = await fetch(`${API_URL}`);
      const { data: backupData, signature: backupSignature } = await backupResponse.json();
  
      if (verifyDataIntegrity(backupData, backupSignature)) {
        setData(backupData);
        setSignature(backupSignature);
        console.log("Data recovered successfully from backup!");
      } else {
        console.error("Recovered data from backup integrity verification failed!");
        //there could be another mechanisms to try to backup
      }
    } catch (error) {
      console.error("Error recovering data from backup:", error.message);
      //there could be another mechanisms to try to backup
    }
  };

  const updateData = async () => {             // before sending the data to the server, we have to sign the data
    const datatosign=JSON.stringify({data});
    const signature=signData(datatosign);
    await fetch(`API_URL`, {
      method: "POST",
      body: JSON.stringify({ data: datatosign, signature }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    await getData();
  };

  const verifyData = async () => {               // verification of data 
    const isDataValid= verifyDataIntegrity(data,signature);
    alert(`Data integrity : ${isDataValid?"valid data":"Invalid data"}`);
  };

  const verifyDataIntegrity=(data:string | undefined, signature: string | undefined) => {   //verification of data integrity 
    if(!data || !signature){ //missing data or signature
      return false;  
    } 
    const calculatedsignature = CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
    return calculatedsignature === signature;
   // throw new Error("not implemented");
  };

  const signData = (data: string) => {
    const secretkey = 'your-secret-key';
    const signature = CryptoJS.HmacSHA256(data, secretkey).toString(CryptoJS.enc.HEX);
    return signature;
   // throw new Error("not implemented");
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "absolute",
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
        fontSize: "30px",
      }}
    >
      <div>Saved Data</div>
      <input
        style={{ fontSize: "30px" }}
        type="text"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={updateData}>
          Update Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={verifyData}>
          Verify Data
        </button>
      </div>
    </div>
  );
}

export default App;
