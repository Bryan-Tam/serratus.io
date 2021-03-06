import React from "react";
import { Helmet } from 'react-helmet';
import { Select } from "react-dropdown-select";
import QueryResult from '../components/QueryResult';
import QueryIntro from "../components/QueryIntro";
import Paginator from '../components/Paginator';
import { useLocation } from 'react-router-dom';
import {
    getPlaceholder,
    getPageLinks,
    getTitle,
    getDataPromise,
    InputOption
} from "../helpers/QueryPageHelpers";
import {
    switchSize,
    classesBoxBorder
} from '../helpers/common';

import allFamilyData from '../data/SerratusIO_scoreID.json';
const familyDomain = Object.keys(allFamilyData).map((family) => { return { label: family, value: family } });

const queryTypes = ["family", "genbank", "run"];

const Query = (props) => {
    let queryTypeFromParam = null;
    let queryValueFromParam = null;
    var urlParams = new URLSearchParams(props.location.search);
    queryTypes.forEach(queryType => {
        var paramValue = urlParams.get(queryType);
        // TODO: mutually exclusive parameters
        if (paramValue) {
            queryTypeFromParam = queryType;
            queryValueFromParam = paramValue;
        }
    });

    // these values don't change until reload
    const queryTypeStatic = queryTypeFromParam;
    const queryValueStatic = queryValueFromParam;
    const pathNameStatic = useLocation().pathname;

    if (!queryTypeFromParam) { queryTypeFromParam = "family" }  // set default
    const [selectValues, setSelectValues] = React.useState([]);
    const [searchType, setSearchType] = React.useState(queryTypeFromParam);
    const [searchValue, setSearchValue] = React.useState("");
    const [placeholderText, setPlaceholderText] = React.useState(getPlaceholder(queryTypeFromParam));
    const [pageTitle, setPageTitle] = React.useState();
    const [pageNumber, setPageNumber] = React.useState(1);
    const [queryValueCorrected, setQueryValueCorrected] = React.useState(queryValueStatic);
    const [dataPromise, setDataPromise] = React.useState();
    
    // clicked "Query" on navigation bar
    if (queryValueStatic && !queryValueFromParam) {
        loadQueryPage(null);
    }

    function searchOnKeyUp(e) {
        if (e.keyCode === 13) {
            loadQueryPage(e.target.value);
        }
        else {
            setSearchValue(e.target.value);
        }
    }

    function dropdownOnChange(values) {
        setSelectValues(values);
        if (values.length !== 0) {
            loadQueryPage(values[0].value);
        }
    }

    function loadQueryPage(searchValue) {
        if (searchValue && !searchType) {
            // TODO: display indicator "no query type selected"
            return;
        }
        let newUrl = searchValue ? `${pathNameStatic}?${searchType}=${searchValue}` : pathNameStatic;
        window.location.href = newUrl;
    }

    function queryTypeChange(e) {
        let queryType = e.target.value;
        setPlaceholderText(getPlaceholder(queryType));
        setSearchType(queryType);
        setPageNumber(1);
    }

    React.useEffect(() => {
        if (!queryValueStatic) {
            return;
        }
        console.log(`Loading query result page for ${queryTypeStatic}=${queryValueStatic}.`);
        setDataPromise(getDataPromise(queryTypeStatic, queryValueStatic, pageNumber));
        // check for AMR accession
        console.log(dataPromise);
        let valueCorrected = queryValueStatic;
        if (queryTypeStatic === "genbank") {
            let patternForAMR = /.*_\d{7}/g;
            let isFromAMR = queryValueStatic.match(patternForAMR);
            if (isFromAMR) {
                valueCorrected = valueCorrected.slice(0, valueCorrected.lastIndexOf("_"));
                setQueryValueCorrected(valueCorrected);
            }
        }
        getTitle(queryTypeStatic, queryValueStatic, valueCorrected).then(setPageTitle);
    }, [queryTypeStatic, queryValueStatic, pageNumber]);

    let headTags = (
        <Helmet>
            <title>
                Serratus | {queryValueStatic ? `${queryValueStatic}` : "Query"}
            </title>
        </Helmet>
    )

    return (
        <div className={`flex flex-col ${switchSize}:flex-row p-4 min-h-screen sm:bg-gray-200`}>
            {headTags}
            <div className={`p-4 w-full ${switchSize}:w-1/3 ${classesBoxBorder}`}>
                <div className="flex flex-col items-center z-10 mt-2">
                    <div className="items-center z-10">
                        <div>
                            <InputOption className="inline mx-2" value="family" displayText="Family" checked={searchType === "family"} onChange={queryTypeChange} />
                            <InputOption className="inline mx-2" value="genbank" displayText="GenBank" checked={searchType === "genbank"} onChange={queryTypeChange} />
                            <InputOption className="inline mx-2" value="run" displayText="SRA Run" checked={searchType === "run"} onChange={queryTypeChange} />
                        </div>
                        {searchType === "family" ?
                            <Select options={familyDomain}
                                values={selectValues}
                                onChange={dropdownOnChange}
                                onDropdownOpen={() => setSelectValues([])}
                                placeholder={placeholderText} /> :
                            <div>
                                <input className="rounded border-2 border-gray-300 px-2 m-1 focus:border-blue-300 focus:outline-none" type="text" placeholder={placeholderText} onKeyUp={searchOnKeyUp} />
                                <button onClick={() => loadQueryPage(searchValue)} className="rounded bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4" type="submit">Go</button>
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className={`h-0 sm:h-3 ${switchSize}:w-3`}></div>
            <hr className="sm:hidden" />
            <div className={`p-4 w-full ${switchSize}:w-2/3 ${classesBoxBorder}`}>
                {queryValueStatic ?
                    <div>
                        <div className="w-full text-center">
                            <div>
                                <div className="text-xl font-bold">{queryValueStatic}</div>
                                {pageTitle ?
                                    <div className="text-lg italic">{pageTitle}</div> : null}
                            </div>
                        </div>
                        <div className="flex justify-center items-center my-2">
                            {getPageLinks(queryTypeStatic, queryValueCorrected)}
                        </div>
                    </div> : null}
                <div className="w-full flex flex-col p-6">
                    {queryValueStatic ?
                        <div>
                            {searchType === 'run' ?
                                <QueryResult type={queryTypeStatic} value={queryValueStatic} dataPromise={dataPromise} />
                             :
                             <div>
                                <Paginator pageNumber={pageNumber} setPageNumber={setPageNumber} />
                                <QueryResult type={queryTypeStatic} value={queryValueStatic} dataPromise={dataPromise} />
                            </div>
                            }
                        </div>
                        :
                        <QueryIntro />
                    }
                </div>
            </div>
        </div>
    )
}

export default Query;
