class DendroLib {
    constructor(attemptUncertainDatingCaculations = true, useLocalColors = true) {
        this.version = "2.0.0";
        this.attemptUncertainDatingCaculations = attemptUncertainDatingCaculations;
        this.useLocalColors = useLocalColors;

        //dendroLookupId here is a legacy thing and could/should be removed in the future
        this.translationTable = [
            {
                name: "Tree species",
                valueClassId: 1,
                dendroLookupId: 121
            },
            {
                name: "Tree rings",
                valueClassId: 2,
                dendroLookupId: 122
            },
            {
                name: "Earlywood/Latewood",
                valueClassId: 3,
                dendroLookupId: 123
            },
            {
                name: "Number of analysed radii.",
                valueClassId: 4,
                dendroLookupId: 124
            },
            {
                name: "EW/LW measurements",
                valueClassId: 5,
                dendroLookupId: 125 // MAYBE
            },
            {
                name: "Sapwood (Sp)",
                valueClassId: 6,
                dendroLookupId: 126
            },
            {
                name: "Bark (B)",
                valueClassId: 7,
                dendroLookupId: 127
            },
            {
                name: "Waney edge (W)",
                valueClassId: 8,
                dendroLookupId: 128
            },
            {
                name: "Pith (P)",
                valueClassId: 9,
                dendroLookupId: 129
            },
            {
                name: "Tree age ≥",
                valueClassId: 10,
                dendroLookupId: 130
            },
            {
                name: "Tree age ≤",
                valueClassId: 11,
                dendroLookupId: 131
            },
            {
                name: "Inferred growth year ≥",
                valueClassId: 12,
                dendroLookupId: 132
            },
            {
                name: "Inferred growth year ≤",
                valueClassId: 13,
                dendroLookupId: 133
            },
            {
                name: "Estimated felling year",
                valueClassId: 14,
                dendroLookupId: 134
            },
            {
                name: "Possible estimated felling year",
                valueClassId: 15,
                dendroLookupId: 135
            },
            {
                name: "Provenance",
                valueClassId: 16,
                dendroLookupId: 136
            },
            {
                name: "Outermost tree-ring date",
                valueClassId: 17,
                dendroLookupId: 137
            },
            {
                name: "Not dated",
                valueClassId: 18,
                dendroLookupId: 138
            },
            {
                name: "Date note",
                valueClassId: 19,
                dendroLookupId: 139
            },
            {
                name: "Provenance comment",
                valueClassId: 20,
                dendroLookupId: 140
            },
            {
                name: "Non-measured tree rings",
                valueClassId: 21,
                dendroLookupId: null
            },
            {
                name: "Non-measured sapwood rings",
                valueClassId: 22,
                dendroLookupId: null
            },
            {
                name: "Sapwood indicator",
                valueClassId: 23,
                dendroLookupId: null
            }
        ];
    }

    getValueClassNameById(lookupId) {
        for(let key in this.translationTable) {
            if(this.translationTable[key].valueClassId == lookupId) {
                return this.translationTable[key].name;
            }
        }
        return null;
    }
    
    getValueClassIdByName(name) {
        for(let key in this.translationTable) {
            if(this.translationTable[key].name == name) {
                return this.translationTable[key].valueClassId;
            }
        }
        return null;
    }

    dataGroupsToSampleDataObjects(dataGroups) {
        let sampleDataObjects = [];
		dataGroups.forEach(dataGroup => {
			let sampleDataObject = {
                physical_sample_id: dataGroup.physical_sample_id,
				sample_name: dataGroup.sample_name,
				sampleTaken: dataGroup.date_sampled,
				datasets: []
			};

			dataGroup.values.forEach(value => {
				let dataset = {
                    valueClassId: value.valueClassId,
                    key: value.key,
					value: value.valueType == "complex" ? "complex" : value.value,
                    valueType: value.valueType,
					data: value.valueType == "complex" ? value.data : null
				};
				sampleDataObject.datasets.push(dataset);
			});
            
            sampleDataObject.values = sampleDataObject.datasets;
			sampleDataObjects.push(sampleDataObject);
		});

        return sampleDataObjects;
    }

    dbRowsToSampleDataObjectsOLD(rows) {
        
        /*
        {
        analysis_value_id: '60454',
        value_class_id: 14,
        analysis_entity_id: '168165',
        analysis_value: '1691-1731',
        boolean_value: null,
        is_boolean: null,
        is_uncertain: null,
        is_undefined: null,
        is_not_analyzed: null,
        is_indeterminable: null,
        is_anomaly: null,
        value_type_id: 11,
        method_id: 10,
        parent_id: null,
        name: 'Estimated felling year',
        description: 'The felling year as inferred from the analysed outermost tree-ring date',
        physical_sample_id: 50436,
        sample_name: '75680',
        date_sampled: '2004-11-02',
        dating_range_low_value: 1691,
        dating_range_high_value: 1731,
        dating_range_low_is_uncertain: false,
        dating_range_high_is_uncertain: false,
        dating_range_low_qualifier: null,
        dating_range_age_type_id: 1,
        dating_range_season_id: null,
        dating_range_dating_uncertainty_id: null,
        dating_range_is_variant: null
        }
        */

        //Find unique samples
        let physicalSampleIds = [];
        rows.forEach(row => {
            physicalSampleIds.push(row.physical_sample_id);
        });
        physicalSampleIds = physicalSampleIds.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });

        let sampleDataObjects = [];

        physicalSampleIds.forEach(physicalSampleId => {
            let sampleDataObject = {
                id: physicalSampleId,
                type: "dendro",
                sample_name: "",
                date_sampled: "",
                physical_sample_id: physicalSampleId,
                datasets: []
            }

            rows.forEach(m2 => {
                if(physicalSampleId == m2.physical_sample_id) {
                    sampleDataObject.sample_name = m2.sample_name;
                    sampleDataObject.date_sampled = m2.date_sampled;

                    if(m2.dating_range_low_value || m2.dating_range_high_value) {
                        sampleDataObject.datasets.push({
                            id: m2.value_class_id,
                            valueType: "complex",
                            label: m2.name,
                            value: m2.analysis_value,
                            biblio_id: m2.biblio_id,
                            complexValue: {
                                dating_range_low_value: m2.dating_range_low_value,
                                dating_range_high_value: m2.dating_range_high_value,
                                dating_range_low_is_uncertain: m2.dating_range_low_is_uncertain,
                                dating_range_high_is_uncertain: m2.dating_range_high_is_uncertain,
                                dating_range_low_qualifier: m2.dating_range_low_qualifier,
                                dating_range_age_type_id: m2.dating_range_age_type_id,
                                dating_range_season_id: m2.dating_range_season_id,
                                dating_range_dating_uncertainty_id: m2.dating_range_dating_uncertainty_id,
                                dating_range_is_variant: m2.dating_range_is_variant
                            }
                        });
                    }
                    else {
                        sampleDataObject.datasets.push({
                            id: m2.value_class_id,
                            valueType: "simple",
                            label: m2.name,
                            value: m2.analysis_value,
                            biblio_id: m2.biblio_id,
                        });
                    }
                    
                }
            })
            
            sampleDataObjects.push(sampleDataObject);
        });

        return sampleDataObjects;
    }
    
    getTableRowsAsObjects(contentItem) {
        let sampleNameColKey = this.getTableColumnKeyByTitle(contentItem.data, "Sample name");
        let dateSampledColKey = this.getTableColumnKeyByTitle(contentItem.data, "Date sampled");

        let dataObjects = [];
        for(let rowKey in contentItem.data.rows) {
            let row = contentItem.data.rows[rowKey];

            let dataObject = {
                sample_name: row[sampleNameColKey].value,
                date_sampled: row[dateSampledColKey].value,
                datasets: []
            };
    
            row.forEach(cell => {
                if(cell.type == "subtable") {
    
                    let subTable = cell.value;
                    
                    let idColKey = this.getTableColumnKeyByTitle(subTable, "Dendro lookup id");
                    let labelColKey = this.getTableColumnKeyByTitle(subTable, "Measurement type");
                    let valueColKey = this.getTableColumnKeyByTitle(subTable, "Measurement value");
                    let dataColKey = this.getTableColumnKeyByTitle(subTable, "data");
                    
                    subTable.rows.forEach(subTableRow => {
                        let value = subTableRow[valueColKey].value;
                        if(subTableRow[idColKey].value == 134 || subTableRow[idColKey].value == 137) {
                            //This is Estimated felling year or Outermost tree-ring date, these are complex values that needs to be parsed
                            value = "complex";
                        }

                        let dataset = {
                            id: subTableRow[idColKey].value,
                            label: subTableRow[labelColKey].value,
                            value: value,
                            data: subTableRow[dataColKey].value,
                        };
    
                        dataObject.datasets.push(dataset);
                    })
                    
                }
            })
    
            dataObjects.push(dataObject);
        }
        
        return dataObjects;
    }    

    getDendroMeasurementByName(name, sampleDataObject) {
        let valueClassId = null;
        for(let key in this.translationTable) {
            if(this.translationTable[key].name == name) {
                valueClassId = this.translationTable[key].valueClassId;
            }
        }
    
        if(valueClassId == null) {
            console.warn("Could not find a valueClassId for the measurement name: "+name);
            return false;
        }

        let dpKey = "values";
        if(typeof sampleDataObject.data_points != "undefined") {
            dpKey = "data_points";
        }

        for(let key in sampleDataObject[dpKey]) {
            if(sampleDataObject[dpKey][key].valueClassId == valueClassId) {
                if(sampleDataObject[dpKey][key].valueType == "complex") {
                    return sampleDataObject[dpKey][key].data;
                }
                return sampleDataObject[dpKey][key].value;
            }
        }
    }

    getOldestGerminationYear(dataGroup) {
        let result = {
            name: "Oldest germination year",
            value: null,
            formula: "",
            reliability: null,
            dating_note: null,
            dating_uncertainty: null,
            error_uncertainty: null,
            warnings: []
        };

        let valueMod = 0;
        //if we have an inferrred growth year - great, just return that
        let measurementName = "Inferred growth year ≥";
        let infGrowthYearOlder = this.getDendroMeasurementByName(measurementName, dataGroup);
        if(parseInt(infGrowthYearOlder)) {
            result.value = parseInt(infGrowthYearOlder);
            result.formula = measurementName;
            result.reliability = 1;
            return result;
        }

        //second attempt: Outermost tree-ring date – tree age ≤

        let treeAge = this.getDendroMeasurementByName("Tree age ≤", dataGroup);
        if(treeAge) {
            treeAge = parseInt(treeAge);
        }
        let outerMostTreeRingDate = this.getDendroMeasurementByName("Outermost tree-ring date", dataGroup);
        
        let outerMostTreeRingDateValue = null;
        if(outerMostTreeRingDate) {
            if(outerMostTreeRingDate.dating_range_high_value) {
                outerMostTreeRingDateValue = parseInt(outerMostTreeRingDate.dating_range_high_value);
            }
            if(outerMostTreeRingDate.dating_range_low_value) {
                outerMostTreeRingDateValue = parseInt(outerMostTreeRingDate.dating_range_low_value);
            }
    
            if(outerMostTreeRingDate.dating_range_age_type_id != 1 && outerMostTreeRingDate.dating_range_age_type_id != null) {
                result.warnings.push("Outermost tree-ring date has an unsupported age_type: "+outerMostTreeRingDate.dating_range_age_type_id);
            }
            if(outerMostTreeRingDate.dating_range_dating_uncertainty_id) {
                result.dating_uncertainty = outerMostTreeRingDate.dating_range_dating_uncertainty_id;
            }
    
            if(outerMostTreeRingDateValue && treeAge) {
                result.value = outerMostTreeRingDateValue - treeAge;
                result.formula = "Outermost tree-ring date - Tree age ≤";
                result.reliability = 2;
                result.warnings.push("Oldest germination year was calculated using: "+result.formula);
                result.value += valueMod;
                return result;
            }
        }

        //3. Outermost tree-ring date - Tree rings - Distance to pith
        let treeRings = this.getDendroMeasurementByName("Tree rings", dataGroup);
        let pith = this.parsePith(this.getDendroMeasurementByName("Pith (P)", dataGroup));

        //Pith can have lower & upper values if it is a range, in which case we should select the upper value here
        let pithValue = null;
        let pithSource = " (lower value)";
        if(pith.lower) {
            pithValue  = parseInt(pith.lower);
        }
        else {
            pithValue = parseInt(pith.value);
            pithSource = "";
        }

        if(outerMostTreeRingDateValue && parseInt(treeRings) && pithValue && pith.notes != "Measured width") {
            result.value = outerMostTreeRingDateValue - parseInt(treeRings) - pithValue;
            result.formula = "Outermost tree-ring date - Tree rings - Distance to pith"+pithSource;
            result.reliability = 3;
            result.warnings.push("There is no dendrochronological estimation of the oldest possible germination year, it was therefore calculated using: "+result.formula);
            return result;
        }

        //4. Outermost tree-ring date - Tree rings
        if(outerMostTreeRingDateValue && parseInt(treeRings)) {
            result.value = outerMostTreeRingDateValue - parseInt(treeRings);
            result.formula = "Outermost tree-ring date - Tree rings";
            result.reliability = 4;
            result.warnings.push("There is no dendrochronological estimation of the oldest possible germination year, it was therefore calculated using: "+result.formula);
            return result;
        }
        
        return result;
    }
    
    getYoungestGerminationYear(dataGroup, verbose = false) {
        if(verbose) {
            console.log(dataGroup);
        }

        let result = {
            name: "Youngest germination year",
            value: null,
            formula: "",
            reliability: null,
            dating_note: null,
            dating_uncertainty: null,
            error_uncertainty: null,
            warnings: []
        };

        let valueMod = 0;
        
        //if we have an inferrred growth year - great (actually not sarcasm!), just return that
        let measurementName = "Inferred growth year ≤";
        let infGrowthYearYounger = this.getDendroMeasurementByName(measurementName, dataGroup);
        if(parseInt(infGrowthYearYounger)) {
            result.value = parseInt(infGrowthYearYounger);
            result.formula = measurementName;
            result.reliability = 1;
            return result;
        }
        else if(verbose) {
            console.log("No value found for the inferred growth year ≤");
        }
        
        //If we don't want to attempt to do dating calculations based on other variables, we give up here
        if(this.attemptUncertainDatingCaculations == false) {
            if (verbose) console.log("We're not allowed to attempt dating calculations based on other variables, so we're giving up here");
            return result;
        }
        
        let treeAge = this.getDendroMeasurementByName("Tree age ≥", dataGroup);

        let currentWarnings = [];

        let outerMostTreeRingDate = this.getDendroMeasurementByName("Outermost tree-ring date", dataGroup);
        
        let outerMostTreeRingDateValue = null;
        if(outerMostTreeRingDate) {
            if(verbose) { console.log(outerMostTreeRingDate); }
            if(outerMostTreeRingDate.dating_range_low_value) {
                outerMostTreeRingDateValue = parseInt(outerMostTreeRingDate.dating_range_low_value);
            }
            if(outerMostTreeRingDate.dating_range_high_value) {
                outerMostTreeRingDateValue = parseInt(outerMostTreeRingDate.dating_range_high_value);
            }
    
            if(outerMostTreeRingDate.dating_range_age_type_id != 1 && outerMostTreeRingDate.dating_range_age_type_id != null) {
                result.warnings.push("Outermost tree-ring date has an unsupported age_type: "+outerMostTreeRingDate.dating_range_age_type_id);
            }
            if(outerMostTreeRingDate.dating_range_dating_uncertainty_id) {
                result.dating_uncertainty = outerMostTreeRingDate.dating_range_dating_uncertainty_id;
            }
    
            if(outerMostTreeRingDateValue && treeAge && parseInt(treeAge)) {
                result.value = outerMostTreeRingDateValue - parseInt(treeAge);
                result.formula = "Outermost tree-ring date - Tree age ≥";
                result.reliability = 2;
                result.warnings.push("Youngest germination year was calculated using: "+result.formula);
                result.value += valueMod;
                return result;
            }
        }
        else if(verbose) {
            console.log("No value found for the outermost tree-ring date");
        }
    
        //If the above failed, that means we either don't have Outermost tree-ring date OR Tree age >=
        //If we don't have Outermost tree-ring date we're heckin' hecked and have to give up on dating
        //If we DO have Outermost tree-ring date and also a Pith value and Tree rings, we can try a calculation based on that
        let treeRings = this.getDendroMeasurementByName("Tree rings", dataGroup);
        if(verbose) { console.log(treeRings); }
        let pith = this.parsePith(this.getDendroMeasurementByName("Pith (P)", dataGroup));

        //Pith can have lower & upper values if it is a range, in which case we should select the upper value here
        let pithValue = null;
        let pithSource = " (lower value)";
        if(pith.lower) {
            pithValue  = parseInt(pith.lower);
        }
        else {
            pithValue = parseInt(pith.value);
            pithSource = "";
        }

        if(outerMostTreeRingDateValue && parseInt(treeRings) && pithValue && pith.notes != "Measured width") {
            result.value = outerMostTreeRingDateValue - parseInt(treeRings) - pithValue;
            result.formula = "Outermost tree-ring date - Tree rings - Distance to pith"+pithSource;
            result.reliability = 3;
            result.warnings.push("There is no dendrochronological estimation of the youngest possible germination year, it was therefore calculated using: "+result.formula);
            return result;
        }
        else if(verbose) {
            console.log("No value found for the pith value");
        }


        if(outerMostTreeRingDateValue && parseInt(treeRings)) {
            result.value = outerMostTreeRingDateValue - parseInt(treeRings);
            result.formula = "Outermost tree-ring date - Tree rings";
            result.reliability = 4;
            result.warnings.push("There is no dendrochronological estimation of the youngest possible germination year, it was therefore calculated using: "+result.formula);
            return result;
        }
        else if(verbose) {
            console.log("No value found for the tree rings");
            console.log(outerMostTreeRingDateValue);
            console.log(treeRings);
        }
        
        //At this point we give up
        return result;
    }
    
    getOldestFellingYear(dataGroup) {
        let result = {
            name: "Oldest felling year",
            value: null,
            formula: "",
            reliability: null,
            dating_note: null,
            dating_uncertainty: null,
            error_uncertainty: null,
            warnings: []
        };

        let valueMod = 0;
        
        let estFellingYear = this.getDendroMeasurementByName("Estimated felling year", dataGroup);

        if(estFellingYear) {
            if(estFellingYear.dating_range_age_type_id != 1 && estFellingYear.dating_range_age_type_id != null) {
                result.warnings.push("Estimated felling year has an unsupported age_type: "+estFellingYear.dating_range_age_type_id);
            }
            if(estFellingYear.dating_range_dating_uncertainty_id) {
                result.dating_uncertainty = estFellingYear.dating_range_dating_uncertainty_id;
                //result.warnings.push("The estimated felling year has an uncertainty specified as: "+estFellingYear.dating_uncertainty);
            }
        }
        
        //1 Estimated felling year (older)
        if(estFellingYear && parseInt(estFellingYear.dating_range_low_value)) {
            let value = parseInt(estFellingYear.dating_range_low_value);
            result.value = value + valueMod;
            result.formula = "Estimated felling year (older)";
            result.reliability = 1;
            return result;
        }
        
        //2
        if(estFellingYear && parseInt(estFellingYear.dating_range_high_value)) {
            //If there's no older felling year, but there is a younger one, then consider the oldest possible felling year to be unknown
            //result.warnings.push("No value found for the older estimated felling year, using the younger year instead");
            let value = parseInt(estFellingYear.dating_range_high_value);
            result.value = value + valueMod;
            result.formula = "Estimated felling year (younger)";
            result.reliability = 2;
            return result;
        }

        return result;
    }

    getYoungestFellingYear(dataGroup) {
        let result = {
            name: "Youngest felling year",
            value: null,
            formula: "",
            reliability: null,
            dating_note: null,
            dating_uncertainty: null,
            error_uncertainty: null,
            warnings: []
        };

        let valueMod = 0;
        
        let estFellingYear = this.getDendroMeasurementByName("Estimated felling year", dataGroup);
        if(!estFellingYear) {
            return result;
        }

        if(estFellingYear) {
            if(estFellingYear.dating_range_age_type_id != 1 && estFellingYear.dating_range_age_type_id != null) {
                result.warnings.push("Estimated felling year has an unsupported age_type: "+estFellingYear.dating_range_age_type_id);
            }
            if(estFellingYear.dating_range_dating_uncertainty_id) {
                result.dating_uncertainty = estFellingYear.dating_range_dating_uncertainty_id;
                //result.warnings.push("The estimated felling year has an uncertainty specified as: "+estFellingYear.dating_uncertainty);
            }
        }
        
        //1
        if(estFellingYear && parseInt(estFellingYear.dating_range_high_value)) {
            let value = parseInt(estFellingYear.dating_range_high_value);
            result.value = value + valueMod;
            result.formula = "Estimated felling year (younger)";
            result.reliability = 1;
            return result;
        }
        
        //2
        if(estFellingYear && parseInt(estFellingYear.dating_range_low_value)) {
            result.warnings.push("No value found for the younger estimated felling year, using the older year instead");
            let value = parseInt(estFellingYear.dating_range_low_value);
            result.value = value + valueMod;
            result.formula = "Estimated felling year (older)";
            result.reliability = 2;
            return result;
        }

        return result;
    }
    
    getSamplesWithinTimespan(sampleDataObjects, startYear, endYear) {
        let selected = sampleDataObjects.filter(sampleDataObject => {

            //let germinationYear = this.getOldestGerminationYear(sampleDataObject);
            //let fellingYear = this.getYoungestFellingYear(sampleDataObject);

            let germinationYear = this.getYoungestGerminationYear(sampleDataObject);
            let fellingYear = this.getOldestFellingYear(sampleDataObject);
            
            //Just a check if both of these values are usable, otherwise there's no point
            if(!germinationYear || !fellingYear) {
                return false;
            }
            
            let leftOverlap = false;
            let innerOverlap = false;
            let outerOverlap = false;
            let rightOverlap = false;

            if(germinationYear.value <= startYear && fellingYear.value >= startYear) {
                leftOverlap = true;
            }

            if(germinationYear.value >= startYear && fellingYear.value <= endYear) {
                innerOverlap = true;
            }

            if(germinationYear.value >= startYear && germinationYear.value <= endYear) {
                rightOverlap = true;
            }

            if(germinationYear.value <= startYear && fellingYear.value >= endYear) {
                outerOverlap = true;
            }

            if(leftOverlap || innerOverlap || outerOverlap || rightOverlap) {
                return true;
            }

            return false;
        });

        return selected;
    }

    /**
     * parsePith
     * 
     * The values of pith measurements are numeric values but often represented with string modifiers such as ~ and < and - for ranges,
     * and thus require interpretation
     * 
     * Yes, quite so
     * 
     * If value could not be parsed/interpreted, the value attr of the return obj will be NaN
     * 
     * @param {*} rawPith 
     * @returns 
     */
    parsePith(rawPith) {
        if(typeof rawPith == "undefined") {
            return false;
        }
    
        let result = {
            rawValue: rawPith,
            strValue: rawPith,
            value: parseInt(rawPith),
            lower: NaN,
            upper: NaN,
            note: "Could not parse",
        };

        if(Number.isInteger(rawPith)) {
            rawPith = rawPith.toString();
            result.note = "Discrete number of rings";
        }
    
        if(rawPith.indexOf("x") !== -1) {
            result.note = "No value";
        }
    
        if(rawPith.indexOf("~") !== -1 && rawPith.indexOf("~", rawPith.indexOf("~")+1) == -1) {
            result.strValue = rawPith.substring(rawPith.indexOf("~")+1).trim();
            let range = this.valueIsRange(result.strValue);
            if(range !== false) {
                result.value = range.value;
                result.lower = range.lower;
                result.upper = range.upper;
                result.note = "Estimation, with range";
            }
            else {
                result.value = parseInt(result.strValue);
                result.note = "Estimation";
            }
        }
    
        if(rawPith.indexOf(">") !== -1) {
            result.strValue = rawPith.substring(rawPith.indexOf(">")+1).trim();
            let range = this.valueIsRange(result.strValue);
            if(range !== false) {
                result.value = range.value;
                result.lower = range.lower;
                result.upper = range.upper;
                result.note = "Greater than, with range";    
            }
            else {
                result.value = parseInt(result.strValue);
                result.note = "Greater than";
            }
        }
    
        if(rawPith.indexOf("<") !== -1) {
            result.strValue = rawPith.substring(rawPith.indexOf("<")+1).trim();
            let range = this.valueIsRange(result.strValue);
            if(range !== false) {
                result.value = range.value;
                result.lower = range.lower;
                result.upper = range.upper;
                result.note = "Less than, with range";    
            }
            else {
                result.value = parseInt(result.strValue);
                result.note = "Less than";
            }
        }
    
        if(rawPith.indexOf("&gt;") !== -1) {
            result.strValue = rawPith.substring(rawPith.indexOf("&gt;")+4).trim();
            let range = this.valueIsRange(result.strValue);
            if(range !== false) {
                result.value = range.value;
                result.lower = range.lower;
                result.upper = range.upper;
                result.note = "Greater than, with range";    
            }
            else {
                result.value = parseInt(result.strValue);
                result.note = "Greater than";
            }
        }
    
        if(rawPith.indexOf("&lt;") !== -1) {
            result.strValue = rawPith.substring(rawPith.indexOf("&lt;")+4).trim();
            let range = this.valueIsRange(result.strValue);
            if(range !== false) {
                result.value = range.value;
                result.lower = range.lower;
                result.upper = range.upper;
                result.note = "Less than, with range";    
            }
            else {
                result.value = parseInt(result.strValue);
                result.note = "Less than";
            }
        }
    
        if(rawPith.indexOf("≤") !== -1) {
            result.strValue = rawPith.substring(rawPith.indexOf("≤")+1).trim();
            let range = this.valueIsRange(result.strValue);
            if(range !== false) {
                result.value = range.value;
                result.lower = range.lower;
                result.upper = range.upper;
                result.note = "Equal to or less than, with range";    
            }
            else {
                result.value = parseInt(result.strValue);
                result.note = "Equal to or less than";
            }
        }
        
        if(rawPith.indexOf("≥") !== -1) {
            result.strValue = rawPith.substring(rawPith.indexOf("≥")+1).trim();
            let range = this.valueIsRange(result.strValue);
            if(range !== false) {
                result.value = range.value;
                result.lower = range.lower;
                result.upper = range.upper;
                result.note = "Equal to or greater than, with range";    
            }
            else {
                result.value = parseInt(result.strValue);
                result.note = "Equal to or greater than";
            }
        }
    
        if(rawPith.indexOf("\"") !== -1) {
            result.strValue = rawPith.substring(rawPith.indexOf("\"")+1).trim();
            let range = this.valueIsRange(result.strValue);
            if(range !== false) {
                result.value = range.value;
                result.lower = range.lower;
                result.upper = range.upper;
                result.note = "Measured width"; //Note that this is a measurement of width - not of number of rings
            }
            else {
                result.value = parseInt(result.strValue);
                result.note = "Measured width";
            }
        }
        
        return result;
    }
    
    valueIsRange(value) {
        let result = {
            value: value,
            lower: null,
            upper: null
        };
        if(value.indexOf("-") !== -1) {
            let lower = value.substring(0, value.indexOf("-"));
            let upper = value.substring(value.indexOf("-")+1);
            result.lower = parseInt(lower);
            result.upper = parseInt(upper);
        }
        else {
            return false;
        }
    
        return result;
    }
    
    
    stripNonDatedObjects(sampleDataObjects) {
        return sampleDataObjects.filter((sampleDataObject) => {
            let notDated = this.getDendroMeasurementByName("Not dated", sampleDataObject);
            if(typeof notDated != "undefined") {
                //if we have explicit information that this is not dated...
                return false;
            }
            let efy = this.getDendroMeasurementByName("Estimated felling year", sampleDataObject);
            if(!efy) {
                //Or if we can't find a felling year...
                return false;
            }
            return true;
        })
    }


    renderDendroDatingAsString(datingObject, site = null, useTooltipMarkup = true, sqs = null) {
        if (!datingObject) {
            console.warn("In renderDendroDatingAsString, datingObject was not provided.");
            return "";
        }
    
        let renderStr = "";
    
        // Handle uncertainty markup if applicable
        if (useTooltipMarkup && (datingObject.dating_range_low_is_uncertain || datingObject.dating_range_high_is_uncertain)) {
            let uncertaintyDesc = "";
            if (site && site.lookup_tables.error_uncertainty) {
                const matchingEntry = Object.values(site.lookup_tables.error_uncertainty).find(
                    entry => entry.error_uncertainty_type === (datingObject.dating_range_low_is_uncertain || datingObject.dating_range_high_is_uncertain)
                );
                if (matchingEntry) {
                    uncertaintyDesc = matchingEntry.description;
                }
            }
            renderStr = `!%data:uncertain:!%tooltip:${uncertaintyDesc}:! `;
            if (sqs) {
                renderStr = sqs.parseStringValueMarkup(renderStr);
            } else {
                console.warn("Skipping parseStringValueMarkup since we have no reference to sqs");
            }
        }
    
        let olderDate = datingObject.dating_range_low_value;
        let youngerDate = datingObject.dating_range_high_value;
        let olderSeasonPrefix = "";
        let youngerSeasonPrefix = "";
    
        if (datingObject.dating_range_season_id) {
            olderSeasonPrefix = this.getSeasonPrefix(datingObject.dating_range_season_id, site);
            youngerSeasonPrefix = olderSeasonPrefix;
        }
    
        if (youngerDate && olderDate) {
            renderStr += `${olderSeasonPrefix}${olderDate} - ${youngerSeasonPrefix}${youngerDate}`;
        } else if (youngerDate) {
            renderStr += `${youngerSeasonPrefix}${youngerDate}`;
        } else if (olderDate) {
            renderStr += `${olderSeasonPrefix}${olderDate}`;
        }
    
        if (datingObject.dating_range_age_type_id && site) {
            let ageType = site.lookup_tables.age_types?.find(
                item => item.age_type_id === datingObject.dating_range_age_type_id
            );
            if (ageType) {
                renderStr += ` ${ageType.age_type_name}`;
            }
        }
    
        if (datingObject.dating_range_dating_uncertainty_id && site) {
            let uncertaintyEntry = site.lookup_tables.dating_uncertainty?.find(
                item => item.dating_uncertainty_id === datingObject.dating_range_dating_uncertainty_id
            );
            if (uncertaintyEntry && uncertaintyEntry.uncertainty === "From") {
                renderStr = `After ${renderStr}`;
            }
        }
    
        if (datingObject.dating_range_is_variant) {
            renderStr += " (variant)";
        }
    
        if (datingObject.dating_note && useTooltipMarkup && sqs == null) {
            console.warn("In renderDendroDatingAsString, useTooltipMarkup was requested but no reference to SQS was provided!");
        }
        if (datingObject.dating_note && useTooltipMarkup && sqs) {
            renderStr = `!%data:${renderStr}:!%tooltip:${datingObject.dating_note}:! `;
            renderStr = sqs.parseStringValueMarkup(renderStr, {
                drawSymbol: true,
                symbolChar: "fa-exclamation",
            });
        }
    
        return renderStr;
    }
    
    getSeasonPrefix(seasonId, site) {
        if (!site || !site.lookup_tables || !site.lookup_tables.seasons) {
            return "";
        }
        let season = site.lookup_tables.seasons.find(season => season.season_id === seasonId);
        return season ? season.season_name.charAt(0) + " " : "";
    }

    getBarColorByTreeSpecies(treeSpecies) {
        let colors = [];
        if(this.useLocalColors) {
            console.log("Using local colors");
            colors = ['#0074ab', '#005178', '#bfeaff', '#80d6ff', '#ff7900', '#b35500', '#ffdebf', '#ffbc80', '#daff00', '#99b300'];
            colors = ["#da4167","#899d78","#03440c","#392f5a","#247ba0","#0b3948","#102542"];
            colors = ["#e63946", "#5a9e2f", "#117733", "#76428a", "#1d70b8", "#2a628f", "#004d73"];
        }
        else {
            colors = this.sqs.color.getColorScheme(7);
        }

        switch(treeSpecies.toLowerCase()) {
            case "hassel":
                return colors[0];
            case "gran":
                return colors[1];
            case "tall":
                return colors[2];
            case "asp":
                return colors[3];
            case "björk":
                return colors[4];
            case "ek":
                return colors[5];
            case "bok":
                return colors[6];
        }
        return "black";
    }

    dataGroupToSampleDataObject(dataGroup) {
        let sampleDataObject = {
            physical_sample_id: dataGroup.physical_sample_id,
            sample_name: dataGroup.sample_name,
            sampleTaken: dataGroup.date_sampled,
            datasets: []
        };

        dataGroup.values.forEach(value => {
            let dataset = {
                id: value.lookupId,  //legacy
                lookupId: value.lookupId,
                label: value.key, //legacy
                key: value.key,
                value: value.valueType == "complex" ? "complex" : value.value,
                valueType: value.valueType,
                data: value.valueType == "complex" ? value.data : null
            };
            sampleDataObject.datasets.push(dataset);
        });

        sampleDataObject.values = sampleDataObject.datasets;
        return sampleDataObject;
    }

    dbRowsToSampleDataObjects(rows) {
        /*
        {
        analysis_value_id: '60454',
        value_class_id: 14,
        analysis_entity_id: '168165',
        analysis_value: '1691-1731',
        boolean_value: null,
        is_boolean: null,
        is_uncertain: null,
        is_undefined: null,
        is_not_analyzed: null,
        is_indeterminable: null,
        is_anomaly: null,
        value_type_id: 11,
        method_id: 10,
        parent_id: null,
        name: 'Estimated felling year',
        description: 'The felling year as inferred from the analysed outermost tree-ring date',
        physical_sample_id: 50436,
        sample_name: '75680',
        date_sampled: '2004-11-02',
        dating_range_low_value: 1691,
        dating_range_high_value: 1731,
        dating_range_low_is_uncertain: false,
        dating_range_high_is_uncertain: false,
        dating_range_low_qualifier: null,
        dating_range_age_type_id: 1,
        dating_range_season_id: null,
        dating_range_dating_uncertainty_id: null,
        dating_range_is_variant: null
        }
        */

        //Find unique samples
        let physicalSampleIds = [];
        rows.forEach(row => {
            physicalSampleIds.push(row.physical_sample_id);
        });
        physicalSampleIds = physicalSampleIds.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });

        let sampleDataObjects = [];

        physicalSampleIds.forEach(physicalSampleId => {
            let sampleDataObject = {
                id: physicalSampleId,
                type: "dendro",
                sample_name: "",
                date_sampled: "",
                physical_sample_id: physicalSampleId,
                datasets: []
            }

            rows.forEach(m2 => {
                if(physicalSampleId == m2.physical_sample_id) {
                    sampleDataObject.sample_name = m2.sample_name;
                    sampleDataObject.date_sampled = m2.date_sampled;

                    if(m2.dating_range_low_value || m2.dating_range_high_value) {
                        sampleDataObject.datasets.push({
                            id: m2.value_class_id,
                            valueType: "complex",
                            label: m2.name,
                            value: m2.analysis_value,
                            biblio_id: m2.biblio_id,
                            complexValue: {
                                dating_range_low_value: m2.dating_range_low_value,
                                dating_range_high_value: m2.dating_range_high_value,
                                dating_range_low_is_uncertain: m2.dating_range_low_is_uncertain,
                                dating_range_high_is_uncertain: m2.dating_range_high_is_uncertain,
                                dating_range_low_qualifier: m2.dating_range_low_qualifier,
                                dating_range_age_type_id: m2.dating_range_age_type_id,
                                dating_range_season_id: m2.dating_range_season_id,
                                dating_range_dating_uncertainty_id: m2.dating_range_dating_uncertainty_id,
                                dating_range_is_variant: m2.dating_range_is_variant
                            }
                        });
                    }
                    else {
                        sampleDataObject.datasets.push({
                            id: m2.value_class_id,
                            valueType: "simple",
                            label: m2.name,
                            value: m2.analysis_value,
                            biblio_id: m2.biblio_id,
                        });
                    }
                    
                }
            })

            /*
            datingRows.forEach(m2 => {
                if(physicalSampleId == m2.physical_sample_id) {
                    sampleDataObject.datasets.push({
                        id: m2.dendro_lookup_id,
                        label: m2.date_type,
                        value: "complex",
                        data: {
                            age_type: m2.age_type,
                            older: m2.older,
                            younger: m2.younger,
                            plus: m2.plus,
                            minus: m2.minus,
                            dating_uncertainty: m2.dating_uncertainty_id,
                            error_uncertainty: m2.error_uncertainty,
                            season_id: m2.season_id,
                            season_type_id: m2.season_type_id,
                            season_name: m2.season_name,
                            dating_note: m2.dating_note
                        }
                    });
                }
            });
            */
            
            sampleDataObjects.push(sampleDataObject);
        });

        /*
        sampleDataObjects.forEach(sampleDataObject => {
            if(sampleDataObject.sample_name == "75680") {
                console.log(sampleDataObject);
            }
        });
        */
        return sampleDataObjects;
    }
}

export { DendroLib as default }
