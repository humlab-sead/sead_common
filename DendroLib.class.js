class DendroLib {
    constructor(attemptUncertainDatingCaculations = true, useLocalColors = true) {
        this.version = "1.0.0";
        this.attemptUncertainDatingCaculations = attemptUncertainDatingCaculations;
        this.useLocalColors = useLocalColors;

        this.translationTable = [
            {
                name: "Tree species", //Original (legacy name)
                title: "Tree species", //The proper name it should be called (subject to change)
                dendroLookupId: 121,
            },
            {
                name: "Tree rings",
                title: "Tree rings",
                dendroLookupId: 122
            },
            {
                name: "earlywood/late wood",
                title: "earlywood/late wood",
                dendroLookupId: 123
            },
            {
                name: "No. of radius ",
                title: "No. of radius ",
                dendroLookupId: 124
            },
            {
                name: "3 time series",
                title: "3 time series",
                dendroLookupId: 125
            },
            {
                name: "Sapwood (Sp)",
                title: "Sapwood (Sp)",
                dendroLookupId: 126
            },
            {
                name: "Bark (B)",
                title: "Bark (B)",
                dendroLookupId: 127
            },
            {
                name: "Waney edge (W)",
                title: "Waney edge (W)",
                dendroLookupId: 128
            },
            {
                name: "Pith (P)",
                title: "Pith (P)",
                dendroLookupId: 129
            },
            {
                name: "Tree age ≥",
                title: "Tree age ≥",
                dendroLookupId: 130
            },
            {
                name: "Tree age ≤",
                title: "Tree age ≤",
                dendroLookupId: 131
            },
            {
                name: "Inferred growth year ≥",
                title: "Inferred growth year ≥",
                dendroLookupId: 132
            },
            {
                name: "Inferred growth year ≤",
                title: "Inferred growth year ≤",
                dendroLookupId: 133
            },
            {
                name: "Estimated felling year",
                title: "Estimated felling year",
                dendroLookupId: 134
            },
            {
                name: "Estimated felling year, lower accuracy",
                title: "Estimated felling year, lower accuracy",
                dendroLookupId: 135
            },
            {
                name: "Provenance",
                title: "Provenance",
                dendroLookupId: 136
            },
            {
                name: "Outermost tree-ring date",
                title: "Outermost tree-ring date",
                dendroLookupId: 137
            },
            {
                name: "Not dated",
                title: "Not dated",
                dendroLookupId: 138
            },
            {
                name: "Date note",
                title: "Date note",
                dendroLookupId: 139
            },
            {
                name: "Provenance comment",
                title: "Provenance comment",
                dendroLookupId: 140
            },
        ];
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
					id: value.lookupId,
					label: value.key,
					value: value.valueType == "complex" ? "complex" : value.value,
					data: value.valueType == "complex" ? value.data : null
				};
				sampleDataObject.datasets.push(dataset);
			});

			sampleDataObjects.push(sampleDataObject);
		});

        return sampleDataObjects;
    }

    newDbRowsToSampleDataObjects(rows) {

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
                            value: m2.analysis_value
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

    dbRowsToSampleDataObjects(measurementRows, datingRows) {
        let sampleDataObjects = [];

        //Find unique samples
        let physicalSampleIds = [];
        measurementRows.forEach(row => {
            physicalSampleIds.push(row.physical_sample_id);
        });
        physicalSampleIds = physicalSampleIds.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });

        physicalSampleIds.forEach(physicalSampleId => {
            let sampleDataObject = {
                id: physicalSampleId,
                type: "dendro",
                sample_name: "",
                date_sampled: "",
                physical_sample_id: physicalSampleId,
                datasets: []
            }

            measurementRows.forEach(m2 => {
                if(physicalSampleId == m2.physical_sample_id) {
                    //Convert value to an integer if possible, otherwise leave as string
                    let value = m2.measurement_value;
                    let intVal = parseInt(m2.measurement_value);
                    if(!isNaN(intVal)) {
                        value = intVal;
                    }

                    sampleDataObject.sample_name = m2.sample;
                    sampleDataObject.date_sampled = m2.date_sampled;

                    sampleDataObject.datasets.push({
                        id: m2.dendro_lookup_id,
                        label: m2.date_type,
                        value: value
                    });
                }
            })

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
        let dendroLookupId = null;
        for(let key in this.translationTable) {
            if(this.translationTable[key].name == name) {
                dendroLookupId = this.translationTable[key].dendroLookupId;
            }
        }
    
        if(dendroLookupId == null) {
            return false;
        }

        let dpKey = "values";
        if(typeof sampleDataObject.data_points != "undefined") {
            dpKey = "data_points";
        }

        for(let key in sampleDataObject[dpKey]) {
            if(sampleDataObject[dpKey][key].lookupId == dendroLookupId) {
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
            if(outerMostTreeRingDate.younger) {
                outerMostTreeRingDateValue = parseInt(outerMostTreeRingDate.younger);
            }
            if(outerMostTreeRingDate.older) {
                outerMostTreeRingDateValue = parseInt(outerMostTreeRingDate.older);
            }
    
            if(outerMostTreeRingDate.age_type != "AD" && outerMostTreeRingDate.age_type != null) {
                result.warnings.push("Outermost tree-ring date has an unsupported age_type: "+outerMostTreeRingDate.age_type);
            }
            if(outerMostTreeRingDate.dating_uncertainty) {
                result.dating_uncertainty = outerMostTreeRingDate.dating_uncertainty;
            }
            if(outerMostTreeRingDate.error_uncertainty) {
                result.error_uncertainty = outerMostTreeRingDate.error_uncertainty;
                result.warnings.push("The outermost tree-ring date has an uncertainty specified as: "+outerMostTreeRingDate.error_uncertainty);
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
    
    getYoungestGerminationYear(dataGroup) {
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
        
        //If we don't want to attempt to do dating calculations based on other variables, we give up here
        if(this.attemptUncertainDatingCaculations == false) {
            return result;
        }
        
        let treeAge = this.getDendroMeasurementByName("Tree age ≥", dataGroup);

        let currentWarnings = [];

        let outerMostTreeRingDate = this.getDendroMeasurementByName("Outermost tree-ring date", dataGroup);
        
        let outerMostTreeRingDateValue = null;
        if(outerMostTreeRingDate) {
            if(outerMostTreeRingDate.older) {
                outerMostTreeRingDateValue = parseInt(outerMostTreeRingDate.older);
            }
            if(outerMostTreeRingDate.younger) {
                outerMostTreeRingDateValue = parseInt(outerMostTreeRingDate.younger);
            }
    
            if(outerMostTreeRingDate.age_type != "AD" && outerMostTreeRingDate.age_type != null) {
                result.warnings.push("Outermost tree-ring date has an unsupported age_type: "+outerMostTreeRingDate.age_type);
            }
            if(outerMostTreeRingDate.dating_uncertainty) {
                result.dating_uncertainty = outerMostTreeRingDate.dating_uncertainty;
            }
            if(outerMostTreeRingDate.error_uncertainty) {
                result.error_uncertainty = outerMostTreeRingDate.error_uncertainty;
                result.warnings.push("The outermost tree-ring date has an uncertainty specified as: "+outerMostTreeRingDate.error_uncertainty);
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
    
        //If the above failed, that means we either don't have Outermost tree-ring date OR Tree age >=
        //If we don't have Outermost tree-ring date we're heckin' hecked and have to give up on dating
        //If we DO have Outermost tree-ring date and also a Pith value and Tree rings, we can try a calculation based on that
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
            result.warnings.push("There is no dendrochronological estimation of the youngest possible germination year, it was therefore calculated using: "+result.formula);
            return result;
        }


        if(outerMostTreeRingDateValue && parseInt(treeRings)) {
            result.value = outerMostTreeRingDateValue - parseInt(treeRings);
            result.formula = "Outermost tree-ring date - Tree rings";
            result.reliability = 4;
            result.warnings.push("There is no dendrochronological estimation of the youngest possible germination year, it was therefore calculated using: "+result.formula);
            return result;
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
            if(estFellingYear.age_type != "AD" && estFellingYear.age_type != null) {
                result.warnings.push("Estimated felling year has an unsupported age_type: "+estFellingYear.age_type);
            }
            if(estFellingYear.dating_uncertainty) {
                result.dating_uncertainty = estFellingYear.dating_uncertainty;
                //result.warnings.push("The estimated felling year has an uncertainty specified as: "+estFellingYear.dating_uncertainty);
            }
            if(estFellingYear.error_uncertainty) {
                result.error_uncertainty = estFellingYear.error_uncertainty;
                result.warnings.push("The estimated felling year has an uncertainty specified as: "+estFellingYear.error_uncertainty);
            }
            if(estFellingYear.minus != null && parseInt(estFellingYear.minus)) {
                //result.warnings.push("The estimated felling year has a minus uncertainty specified as: "+estFellingYear.minus);
                valueMod -= estFellingYear.minus;
            }
            if(estFellingYear.plus != null && parseInt(estFellingYear.plus)) {
                //result.warnings.push("The estimated felling year has a plus uncertainty specified as: "+estFellingYear.plus);
            }
        }
        
        
        //1 Estimated felling year (older)
        if(estFellingYear && parseInt(estFellingYear.older)) {
            let value = parseInt(estFellingYear.older);
            result.value = value + valueMod;
            result.formula = "Estimated felling year (older)";
            result.reliability = 1;
            return result;
        }
        
        //2
        if(estFellingYear && parseInt(estFellingYear.younger)) {
            //If there's no older felling year, but there is a younger one, then consider the oldest possible felling year to be unknown
            //result.warnings.push("No value found for the older estimated felling year, using the younger year instead");
            let value = parseInt(estFellingYear.younger);
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

        if(estFellingYear.age_type != "AD" && estFellingYear.age_type != null) {
            result.warnings.push("Estimated felling year has an unsupported age_type: "+estFellingYear.age_type);
        }
        if(estFellingYear.dating_uncertainty) {
            result.dating_uncertainty = estFellingYear.dating_uncertainty;
            //result.warnings.push("The estimated felling year has an uncertainty specified as: "+estFellingYear.dating_uncertainty);
        }
        if(estFellingYear.error_uncertainty) {
            result.error_uncertainty = estFellingYear.error_uncertainty;
            result.warnings.push("The estimated felling year has an uncertainty specified as: "+estFellingYear.error_uncertainty);
        }
        
        //1
        if(estFellingYear && parseInt(estFellingYear.younger)) {
            let value = parseInt(estFellingYear.younger);
            result.value = value + valueMod;
            result.formula = "Estimated felling year (younger)";
            result.reliability = 1;
            return result;
        }
        
        //2
        if(estFellingYear && parseInt(estFellingYear.older)) {
            result.warnings.push("No value found for the younger estimated felling year, using the older year instead");
            let value = parseInt(estFellingYear.older);
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
    
    parseEstimatedFellingYearLowerAccuracy(rawValue) {
        if(typeof rawValue == "undefined") {
            return false;
        }
    
        let result = {
            rawValue: rawValue,
            strValue: rawValue,
            value: parseInt(rawValue),
            lower: NaN,
            upper: NaN,
            note: "Could not parse",
        };

        //Examples
        // "(E 1085)
        // (V 1723/24)
        // "(1720 ± 2)
        // (V 1720/21); (V 1828/29)
        // (1814-1834)
        // "(E 1195)
        // (1625±2)
        // (S 1688)
        // "(V 1558/59); (V 1703/04); (V 1816/17)
        // "(1850±2); (1810±3)

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
    
    /**
     * renderDendroDatingAsString
     * 
     * @param {*} datingObject 
     * @param {*} site 
     * @param {*} useTooltipMarkup 
     * @param {*} sqs - This needs to be provided if useTooltipMarkup is set to true!
     * @returns 
     */
    renderDendroDatingAsString(datingObject, site = null, useTooltipMarkup = true, sqs = null) {
        if(!datingObject) { //not sure why this would ever happen, but it does
            console.warn("In renderDendroDatingAsString, datingObject was not provided.");
            return "";
        }
        let renderStr = "";
        if(useTooltipMarkup && datingObject.error_uncertainty) {
            // see site 2019 for an example of this
            let uncertaintyDesc = "";
            if(site) {
                for(let key in site.lookup_tables.error_uncertainty) {
                    if(site.lookup_tables.error_uncertainty[key].error_uncertainty_type == datingObject.error_uncertainty) {
                        uncertaintyDesc = site.lookup_tables.error_uncertainty[key].description;
                    }
                }
            }
            renderStr = "!%data:"+datingObject.error_uncertainty+":!%tooltip:"+uncertaintyDesc+":! ";
            if(sqs != null) {
                renderStr = sqs.parseStringValueMarkup(renderStr);
            }
            else {
                console.warn("Skipping parseStringValueMarkup since we have no reference to sqs");
            }
            
        }
        else if(datingObject.error_uncertainty) {
            renderStr = datingObject.error_uncertainty+" ";
        }

        let youngerDate = datingObject.younger;
        let olderData = datingObject.older;
        let olderSeasonPrefix = "";
        let youngerSeasonPrefix = "";
        if(datingObject.season_id && datingObject.season_type_id == 10) {
            //this is a compound season like: "Winter-Summer", in this case the first season refers to the older date and the second to the younger
            let seasonNames = datingObject.season_name.split("-");
            olderSeasonPrefix = seasonNames[0].charAt(0)+" ";
            youngerSeasonPrefix = seasonNames[1].charAt(0)+" ";
            if(seasonNames[1] == "Winter") {
                //if the younger season is winter, we +1 to the year since e.g. 1790 is actually 1790/1791 since it is not possible to determine which year it is during winter
                youngerDate = youngerDate+"/"+String(youngerDate+1).substring(2);
            }
        }
        if(datingObject.season_id && datingObject.season_type_id == 9) {
            //this is a single season like "Summer"
            olderSeasonPrefix = datingObject.season_name.charAt(0)+" ";
            youngerSeasonPrefix = olderSeasonPrefix;
        }

        //if younger season is winter, we +1 to the year since e.g. 1790 is actually 1790/1791 since it is not possible to determine which year it is during winter
        if(youngerDate && datingObject.season_type_id == 9 && datingObject.season_name == "Winter") {
            youngerDate = youngerDate+"/"+String(youngerDate+1).substring(2);
        }

        if(youngerDate && olderData) {   
            renderStr += olderSeasonPrefix+olderData+" - "+youngerSeasonPrefix+youngerDate;
        }
        else if(youngerDate) {
            renderStr += youngerSeasonPrefix+youngerDate;
        }
        else if(olderData) {
            renderStr += olderSeasonPrefix+olderData;
        }
        
        if(datingObject.age_type) {
            renderStr += " "+datingObject.age_type;
        }

        if(datingObject.dating_uncertainty && site != null) {
            //datingObject.dating_uncertainty is actually dating_uncertainty_id and needs to be looked up
            let uncert = site.lookup_tables.dating_uncertainty.find(item => item.dating_uncertainty_id === datingObject.dating_uncertainty);

            if(uncert != null && uncert.uncertainty == "From") {
                renderStr = "After "+renderStr;
            }
        }
        else if(datingObject.dating_uncertainty) {
            console.warn("In renderDendroDatingAsString, datingObject.dating_uncertainty was provided but no reference to site was provided.");
        }

        if(datingObject.minus && datingObject.plus) {
            renderStr += " (+/-"+datingObject.minus+")";
        }
        else if(datingObject.minus) {
            renderStr += " (+0/-"+datingObject.minus+")";
        }
        else if(datingObject.plus) {
            renderStr += " (+"+datingObject.plus+"/-0)";
        }

        if(datingObject.dating_note && useTooltipMarkup && sqs == null) {
            console.warn("In renderDendroDatingAsString, useTooltipMarkup was requested but no reference to SQS were provided!");
        }
        if(datingObject.dating_note && useTooltipMarkup && sqs != null) {
            renderStr = "!%data:"+renderStr+":!%tooltip:"+datingObject.dating_note+":! ";
            renderStr = sqs.parseStringValueMarkup(renderStr, {
                drawSymbol: true,
                symbolChar: "fa-exclamation",
            });
        }

        return renderStr;
    }

    getBarColorByTreeSpecies(treeSpecies) {
        let colors = [];
        if(this.useLocalColors) {
            colors = ['#0074ab', '#005178', '#bfeaff', '#80d6ff', '#ff7900', '#b35500', '#ffdebf', '#ffbc80', '#daff00', '#99b300'];
            colors = ["#da4167","#899d78","#03440c","#392f5a","#247ba0","#0b3948","#102542"];
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
}

export { DendroLib as default }
