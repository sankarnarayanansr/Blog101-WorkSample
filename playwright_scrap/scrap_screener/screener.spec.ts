import { test, expect } from '@playwright/test';
import { JSDOM } from 'jsdom';
import {remapKey , updateData , readOrWriteJsonFile , remapKeysOfObject} from './helper'


const script = `
/**
 * converts array-like object to array
 * @param  collection the object to be converted
 * @return {Array} the converted object
 */
function arrayify(collection) {
  return Array.prototype.slice.call(collection);
}

/**
 * generates factory functions to convert table rows to objects,
 * based on the titles in the table's <thead>
 * @param  {Array[String]} headings the values of the table's <thead>
 * @return {Function}      a function that takes a table row and spits out an object
 */
function factory(headings) {
  return function(row) {
    return arrayify(row.cells).reduce(function(prev, curr, i) {
    console.log(headings[i])
    if (headings[i] === 'Name'){
    console.log(curr)
    if (curr.children[0].href){
    
    var tmp = curr.children[0].href.split('/')
    var tmpIndex = tmp.indexOf('company')
    if (tmpIndex!=-1){
        prev['company'] = tmp[tmpIndex+1]
} 
    }
}
      prev[headings[i]] = curr.innerText;
      return prev;
    }, {});
  }
}

/**
 * given a table, generate an array of objects.
 * each object corresponds to a row in the table.
 * each object's key/value pairs correspond to a column's heading and the row's value for that column
 * 
 * @param  {HTMLTableElement} table the table to convert
 * @return {Array[Object]}       array of objects representing each row in the table
 */
function parseTable(table) {
  var headings = arrayify(table.tBodies[0].rows[0].children).map(function(heading) {
    return heading.innerText;
  });
  return arrayify(table.tBodies[0].rows).map(factory(headings));
}

var table = document.querySelector("table");
var data  = parseTable(table);
console.log(data);
data;

`

test('fetch all details',async({ browser })=>{
    test.setTimeout(30000000);
    const context = await browser.newContext();
    context.setDefaultTimeout(30000000);
    const page = await context.newPage();
    page.setDefaultTimeout(30000000);
    await page.goto('https://www.screener.in/login/');
    await page.getByLabel('Email').click();
    await page.getByLabel('Email').fill('adityasreeram99@gmail.com');
    await page.getByLabel('Email').press('Tab');
    await page.getByLabel('Password').fill('NeuralNet@1');
    await page.getByLabel('Password').press('Tab');
    await page.getByRole('button', { name: ' Login' }).press('Enter');
    var allData = []
    for (var i=1;i<4;i++){
        await page.goto(`https://www.screener.in/screens/29729/top-1000-stocks/?limit=100&page=${i}`);
        const data : [any] = await page.evaluate(script);
       for (var obj of data){
        if (obj.company){
        allData.push(obj)
        }
       }
    }
    var newAllData = []
    var allCompanies : Set<string> = new Set()
    for (var obj of allData){
        var newObj = remapKeysOfObject(obj)
        
        const result = updateData(newAllData, newObj, allCompanies);
        newAllData = result[0];
        allCompanies = result[1];
        console.log(allCompanies)
    }
    readOrWriteJsonFile('write' , JSON.stringify(newAllData))
    await page.pause()
    

})