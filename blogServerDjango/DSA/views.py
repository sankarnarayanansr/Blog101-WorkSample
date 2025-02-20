from django.http import JsonResponse
from django.shortcuts import render
from blogServerDjango.helpers import getDataFromFile , getFileLastUpdate
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import platform
import json
import os
from django.conf import settings

# Get the correct file path
sJsonPath = os.path.join(settings.BASE_DIR, 'static' , 'ques.json')



# Print results

if platform.system() == 'Windows':
    sJsonPath = sJsonPath.replace('/','\\')
@method_decorator(csrf_exempt, name='dispatch')
class FetchData(View):
    _lastUpdated = None
    def getData(self):
        # if self._lastUpdated is None:
        #     self._lastUpdated = getFileLastUpdate(sJsonPath)
        #     self.data = getDataFromFile(sJsonPath)
        # else:
        #     sCurrLastUpdate = getFileLastUpdate(sJsonPath)
        #     if sCurrLastUpdate != self._lastUpdated:
        #         self._lastUpdated = sCurrLastUpdate
        self.data = getDataFromFile(sJsonPath)
                
    def filterByRange(self , data , limits):
        dFilteredData = {}
        dRange = {str(x):1 for x in range(limits[0],limits[1]+1)}
        for key in data:
            if key in dRange:
                dFilteredData[key] = data[key]
        return dFilteredData
                
    def post(self , request):
        self.getData()
        dPostRequest = {}
        if request.body:
            dPostRequest = eval(request.body)
        print(dPostRequest)
        if 'range' in dPostRequest:
            return JsonResponse(self.filterByRange(self.data,[dPostRequest['range'][0],dPostRequest['range'][1]]))
        else:
            return JsonResponse(self.data)
            
            
        
        
        
    