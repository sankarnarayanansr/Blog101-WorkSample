import { test, expect } from '@playwright/test';
import {fetchAllDetailsFromTable } from './helper';
import { JSDOM } from 'jsdom';


var filter_group = ['options_list','options_settings','options_topics','options_companies']

async function enableCheckBoxSections(page){
  await page.evaluate(()=>{
    const checkbox1 : any = document.querySelector('#checkbox-section1')
    const checkbox2 : any = document.querySelector('#checkbox-section2')
    checkbox1.classList.add('show')
    checkbox2.classList.add('show')
  })
  
}
async function disableCheckBoxSections(page){
  await page.evaluate(()=>{
    const checkbox1 : any = document.querySelector('#checkbox-section1')
    const checkbox2 : any = document.querySelector('#checkbox-section2')
    checkbox1.classList.remove('show')
    checkbox2.classList.remove('show')
  })
  
}
async function disableAllFilters(page){
  await enableCheckBoxSections(page)
  await page.evaluate(()=>{
    const checkboxes : any = document.querySelectorAll('.form-check-input[type="checkbox"]')
    console.log(checkboxes)
    checkboxes.forEach(element => {
      
      element.checked = false
      
    });
  })
  await disableCheckBoxSections(page)

}

async function enableSelectedFilter(page , listOfIds){
  await enableCheckBoxSections(page)
  if (!Array.isArray(listOfIds)) {
    throw new Error('listOfIds is not iterable');
  }
  await page.evaluate((listOfIds)=>{

    for (var id of listOfIds){
      const checkbox:any   = document.querySelector(`#${id}.form-check-input[type="checkbox"]`) as HTMLInputElement;
      if (checkbox){
        checkbox.checked = true
      }
    }

  },listOfIds)
  await disableCheckBoxSections(page)
}

async function submitForm(page){
  const formData = await page.evaluate(() => {
    const form = document.querySelector('form');
    const data = {};

    if (form) {
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
          data[input.name] = input.checked;
        } else {
          data[input.name] = input.value;
        }
      });

      const textareas = form.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        data[textarea.name] = textarea.value;
      });

      const selects = form.querySelectorAll('select');
      selects.forEach(select => {
        data[select.name] = select.value;
      });
    }

    console.log('Form data before submission:', data); // Log the collected form data
    return data;
  });

  console.log('Form data before submission:', formData); // Log the collected form data

  await page.waitForLoadState('domcontentloaded');

  // Find the submit button and click it using Playwright's click method
  const submitButton = await page.$('button[type="submit"], input[type="submit"]');
  if (submitButton) {
    await Promise.all([
       // Wait for the page to reload
      submitButton.click(), // Click the submit button
      page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    ]);
  } else {
    console.error('Submit button not found');
  }
}

// async function ensureSingleCheckboxEnabled(page: any, checkboxId: string): Promise<void> {
//   // Locate all checkboxes with the name 'options_list'
//   await page.waitForLoadState('domcontentloaded');
//   const allCheckboxes = await page.locator('.form-check-input[type="checkbox"][name="options_list"]');
  
//   // Iterate through all checkboxes and disable those that are not the target checkbox
//   const checkboxesCount = await allCheckboxes.count();
//   let anyEnabled = false;
//   for (let i = 0; i < checkboxesCount; i++) {
//     const checkbox = allCheckboxes.nth(i);
//     const checkboxIdAttr = await checkbox.getAttribute('id');
//     if (checkboxIdAttr !== checkboxId) {
//       await checkbox.evaluate((node: HTMLInputElement) => node.disabled = true);
//     } else {
//       await checkbox.evaluate((node: HTMLInputElement) => {
//         node.disabled = false;
//         if (node.checked) {
//           anyEnabled = true;
//         }
//       });
//     }
//   }

//   // If no checkboxes are enabled, enable the #all_problems checkbox
//   if (!anyEnabled) {
//     const allProblemsCheckbox = await page.locator('#all_problems.form-check-input[type="checkbox"][name="options_list"]');
//     await allProblemsCheckbox.evaluate((node: HTMLInputElement) => {
//       node.disabled = false;
//       node.checked = true;
//     });
//   }
// }

function textToDocument(text : string , query : string = ''){
  const dom = new JSDOM(text);
  const document = dom.window.document;
  console.log('HTML content:', document.documentElement.outerHTML.slice(1,200) , query);
  if (query !== ''){
    return document.querySelector(query)
  }
  return document
}

// async function  clickUntilAnElementIsVisible(page , clickquery , visibleelement , visible) {
//   while (await page.locator(visibleelement).isVisible() == !visible){
//     await page.locator(clickquery).click()
//   }
// }
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function filterAndUpdateTable(page:any , enableList:string[]){
  
  // await new Promise(resolve => setTimeout(resolve, 5000));
  
  await disableAllFilters(page)
  await enableSelectedFilter(page,enableList)
  await submitForm(page)
  await delay(10000)
  var table = await page.locator('table#results')
  const tableContent = await table.evaluate((node:any) => node.outerHTML);
  return textToDocument(tableContent , 'table#results')
}

async function fetchAllFilters(page:any){
  
  const all_filters = await page.$$(`.form-check-input[type="checkbox"]`);
  var group_all_ids_labels : any = {}
  for (const filter of all_filters) {
    var group : any = await filter.getAttribute('name')
    if (! group_all_ids_labels.hasOwnProperty(group)){
      group_all_ids_labels[group] = []
    }
    var id: any = await filter.getAttribute('id');
    var labelElement = await page.$(`label[for="${id}"]`);
    var label: any = await labelElement?.innerText();
    group_all_ids_labels[group].push({ id, label });
  }
  // filterAndUpdateTable(page,'NONE1',true)
  // filterAndUpdateTable(page,'NONE2',true)
  // filterAndUpdateTable(page,'neet150',true)
  // filterAndUpdateTable(page,'all_problems',true)
  return group_all_ids_labels

  
}

test('fetch all details',async({ browser })=>{
  test.setTimeout(30000000);
  const context = await browser.newContext();
  context.setDefaultTimeout(30000000);
  const page = await context.newPage();
  page.setDefaultTimeout(30000000);

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`Console error ignored: ${msg.text()}`);
    }
  });
  await page.goto('https://leetracer.com/screener')
  
  // 
  var grouped_all_ids : [any]   = await fetchAllFilters(page)
  console.log(grouped_all_ids)
  var toEnableAll: string[] = []
  for (var group of Object.keys(grouped_all_ids)){
    for (var checkBoxId of grouped_all_ids[group]){
    toEnableAll.push(checkBoxId['id'])
    }
  }
  var tableDom : any = await filterAndUpdateTable(page,toEnableAll)
  fetchAllDetailsFromTable(tableDom , '' , true , false,false,false )
  await disableAllFilters(page)
  // ['option_list','option_settings','option_topics','option_companies']
  for (var level0 of grouped_all_ids[filter_group[0]]){
    
    var toEnable : any= []
    for (var level1 of grouped_all_ids[filter_group[1]]){
      toEnable.push(level1['id'])
    }
    var toEnable1 : any = JSON.parse(JSON.stringify(toEnable))
    var toEnable2 : any = JSON.parse(JSON.stringify(toEnable))
    if (level0['id'].includes('all')){
      for (var x of grouped_all_ids[filter_group[3]]){
        toEnable1.push(x.id)
      }
      toEnable1.push(level0['id'])
      toEnable1.push('ALL2')
      for (var level3 of grouped_all_ids[filter_group[2]]){
        if (level3['id'] !== 'ALL1' || level3['id'] !== 'NONE1' ){
          toEnable1.push(level3['id'])
          console.log(toEnable1)
          var tableDom : any = await filterAndUpdateTable(page,toEnable1)
          fetchAllDetailsFromTable(tableDom , level3['id'],false, false , true , false)

          toEnable1.pop()
          

        }
      }
      toEnable1.pop()
      toEnable2.push(level0['id'])
      toEnable2.push('ALL1')

      for (var x of grouped_all_ids[filter_group[2]]){
        toEnable2.push(x.id)
      }
      for (var level3 of grouped_all_ids[filter_group[3]]){
        if (level3['id'] !== 'ALL1' || level3['id'] !== 'NONE1' ){
          toEnable2.push(level3['id'])
          console.log(toEnable2)
          var tableDom : any = await filterAndUpdateTable(page,toEnable2)
          fetchAllDetailsFromTable(tableDom , level3['id'] , false,true,false,false)
          toEnable2.pop()
        }
      }
    }
    else{
      var toEnable3 : any = []
      toEnable3.push(level0['id'])
      toEnable3.push('ALL1')
      toEnable3.push('ALL2')
      for (var level1 of grouped_all_ids[filter_group[1]]){
        toEnable3.push(level1['id'])
      }
      for (var level3 of grouped_all_ids[filter_group[3]]){
        toEnable3.push(level3['id'])
      }
      for (var level3 of grouped_all_ids[filter_group[2]]){
        toEnable3.push(level3['id'])
      }
      console.log(toEnable3)
      var tableDom : any = await filterAndUpdateTable(page,toEnable3)
      fetchAllDetailsFromTable(tableDom , level0['id'], false,false,false,true)


    }
  }


  // for (var {id,label} of all_ids){
  //   if (id === 'NONE1' || id === 'NONE2' || id === 'ALL1' || id === 'ALL2' || id === 'easy'
  //     || id=='medium' || id=='hard' || id == 'all_problems'
  //   ){
  //     continue
  //   }
  //   var tableDom : any = await filterAndUpdateTable(page,id)
  //   fetchAllDetailsFromTable(tableDom , label)
  //   await filterAndUpdateTable(page, id , true , true)
  // }
}) 