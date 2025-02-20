#!/bin/bash

# Start React development server
cd ui && npm start & 

# Start Django development server
cd djangserver && python manage.py runserver