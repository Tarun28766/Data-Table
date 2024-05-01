import './App.css';
import React, { useState } from 'react';
import { Table, MantineProvider, Switch} from '@mantine/core';
import data from './data';

const getMaxMinProductionByYear = (data) => {
  const years = Array.from(new Set(data.map(item => item.Year)));
  const results = [];

  years.forEach(year => {
    const cropsInYear = data.filter(item => item.Year === year);
    const cropsWithProduction = cropsInYear.filter(
      crop => crop["Crop Production (UOM:t(Tonnes))"] !== ""
    );

    if (cropsWithProduction.length === 0) {
      results.push({
        Year: year,
        MaxCrop: "N/A",
        MinCrop: "N/A"
      });
      return;
    }

    let onlyYear = year.split(",")[1].trim();

    const maxCrop = cropsWithProduction.reduce((prev, curr) =>
      prev["Crop Production (UOM:t(Tonnes))"] > curr["Crop Production (UOM:t(Tonnes))"] ? prev : curr
    );

    const minCrop = cropsWithProduction.reduce((prev, curr) =>
      prev["Crop Production (UOM:t(Tonnes))"] < curr["Crop Production (UOM:t(Tonnes))"] ? prev : curr
    );

    results.push({
      Year: onlyYear,
      MaxCrop: maxCrop["Crop Name"],
      MinCrop: minCrop["Crop Name"]
    });
  });

  return results;
};

const calculateAverages = (data) => {
  const cropAverages = {};

  data.forEach((item) => {
    const cropName = item['Crop Name'];
    const yieldValue = item['Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))'];
    const areaValue = item['Area Under Cultivation (UOM:Ha(Hectares))'];

    if (!cropAverages[cropName]) {
      cropAverages[cropName] = {
        yieldSum: 0,
        yieldCount: 0,
        areaSum: 0,
        areaCount: 0,
      };
    }

    if (yieldValue) {
      cropAverages[cropName].yieldSum += yieldValue;
      cropAverages[cropName].yieldCount += 1;
    }

    if (areaValue) {
      cropAverages[cropName].areaSum += areaValue;
      cropAverages[cropName].areaCount += 1;
    }
  });

  return Object.keys(cropAverages).map((crop) => {
    const averages = cropAverages[crop];
    return {
      cropName: crop,
      averageYield: averages.yieldCount ? averages.yieldSum / averages.yieldCount : 0,
      averageArea: averages.areaCount ? averages.areaSum / averages.areaCount : 0,
    };
  });
};

function App() {
  const maxMinProduction = getMaxMinProductionByYear(data);
  const cropAverages = calculateAverages(data);
  const [showTables, setShowTables] = useState(false);
  console.log(showTables)

  const maxMinProductionData = maxMinProduction.map((element) => (
    <Table.Tr key={element.name}>
      <Table.Td>{element.Year}</Table.Td>
      <Table.Td>{element.MaxCrop}</Table.Td>
      <Table.Td>{element.MinCrop}</Table.Td>
    </Table.Tr>
  ));

  const cropAveragesData = cropAverages.map((element) => (
    <Table.Tr key={element.name}>
      <Table.Td>{element.cropName}</Table.Td>
      <Table.Td>{element.averageYield}</Table.Td>
      <Table.Td>{element.averageArea}</Table.Td>
    </Table.Tr>
  ));

  return (
    <MantineProvider>
      <Switch
        checked={showTables}
        onChange={(e) => setShowTables(e.currentTarget.checked)}
        label={showTables ? 'Show Crop Averages table' : 'Show min-max Production table '}
      />
      {showTables ? (
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Year</Table.Th>
            <Table.Th>Crop with Maximum Production in that Year</Table.Th>
            <Table.Th>Crop with Minimum Production in that Year</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{maxMinProductionData}</Table.Tbody>
      </Table> ) : (
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Crop</Table.Th>
            <Table.Th>Average Yield of the Crop between 1950-2020</Table.Th>
            <Table.Th>Average Cultivation Area of the Crop between 1950-2020</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{cropAveragesData}</Table.Tbody>
      </Table> )}
    </MantineProvider>
  );
}

export default App;
