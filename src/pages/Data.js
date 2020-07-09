import React from 'react';
import DataSdk from '../SDK/DataSdk';
import Visual from'../components/Visual';

const  Data = (props) => {
    const [searchString, setSearchString] = React.useState("")
    const [data, setData] = React.useState({});
    const [heatMap, setHeatMap] = React.useState();
    const [imageError, setImageError] = React.useState("");

    const genSra = () => {
        getData(searchString)
        getImage(searchString)
    }

    const getData = async (searchString) => {
        const dataSdk = new DataSdk();
        const sraData = await dataSdk.getSraByName(searchString); 
        setData(sraData);  
        console.log(sraData); 
    }

    const getImage = async (searchString) => {
        const dataSdk = new DataSdk();
        try {
            const img = await dataSdk.getSraHeatMapByName(searchString);
            let sraHeatMap = URL.createObjectURL(img)
            setHeatMap(sraHeatMap)
            console.log(sraHeatMap);
        }
        catch {
            setImageError("No heat map for this SRA")
        }
    }
    
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center">
            {/* <Visual></Visual> */}
            <img src="/serratus.jpg" className="invisible sm:visible opacity-75 sm:fixed" style={{objectFit: 'cover', minWidth: '100vh', minHeight: '100vh'}} />

            <div class="w-1/2 h-full mt-40 mb-24 flex flex-col justify-center items-center z-10 bg-white rounded-lg shadow-2xl">

            <div className="w-4/5 bg-gray-500 h-full"></div>
            <div className="w-4/5 bg-gray-600 h-full"></div>
            <div className="w-4/5 bg-gray-700 h-full"></div>

                {/* <div class="flex flex-col justify-center items-center">
                    {data.sra 
                    ? 
                    <div>SRA: {data.sra}</div> 
                    : 
                    <div>SRA: </div>}
                    {heatMap ? 
                    <img src={heatMap} className="h-full w-full p-6 m-6"></img>
                    : 
                    <div>{imageError}</div> }
                    <div class="flex flex-col justify-center items-center">
                        <input class="p-2 border-black border-2 rounded-lg" onChange={e => setSearchString(e.target.value)}></input>
                        <button class="" onClick={() => genSra()} className="h-10 w-32 border-black border-2 rounded-lg" title="get heat">Search</button>
                    </div>
                    <a src={`https://www.ncbi.nlm.nih.gov/sra/?term=${data.sra}`}></a>
                </div> */}
            </div>
        </div>
    )
}

export default Data

