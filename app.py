# -*- coding: utf-8 -*-
# @Author: Japan Parikh
# @Date:   2019-02-16 15:26:12
# @Last Modified by:   Ranjit Marathay
# @Last Modified time: 2019-07-04 11:38:00


import os
import uuid
import boto3
import json
from datetime import datetime
from pytz import timezone

from flask import Flask, request, render_template
from flask_restful import Resource, Api
from flask_cors import CORS

from werkzeug.exceptions import BadRequest, NotFound
from werkzeug.security import generate_password_hash, \
     check_password_hash

app = Flask(__name__, template_folder='assets')
cors = CORS(app, resources={r'/api/*': {'origins': '*'}})

app.config['DEBUG'] = True


api = Api(app)


db = boto3.client('dynamodb', region_name="us-west-1")
s3 = boto3.client('s3')


# aws s3 bucket where the image is stored
BUCKET_NAME = os.environ.get('MEAL_IMAGES_BUCKET')

# allowed extensions for uploading a profile photo file
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])


def helper_upload_meal_img(file, bucket, key):
    if file and allowed_file(file.filename):
        filename = 'https://s3-us-west-1.amazonaws.com/' \
                   + str(bucket) + '/' + str(key)
        upload_file = s3.put_object(
                            Bucket=bucket,
                            Body=file,
                            Key=key,
                            ACL='public-read',
                            ContentType='image/jpeg'
                        )
        return filename
    return None

def allowed_file(filename):
    """Checks if the file is allowed to upload"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ===========================================================

def formateTime(time):
    hours = time.rsplit(':', 1)[0]
    mins = time.rsplit(':', 1)[1]
    if hours == '00':
        return '{}:{} AM'.format('12', mins)
    elif hours >= '12' and hours < '24':
        if hours == '12':
            return '{}:{} PM'.format(hours, mins)
        return '{}:{} PM'.format((int(hours) - 12), mins)
    else:
        return '{}:{} AM'.format(hours, mins)

class Kitchens(Resource):
    def get(self):
        """Returns all kitchens"""
        response = {}

        try:
            kitchens = db.scan(TableName='kitchens',
                ProjectionExpression='kitchen_name, kitchen_id, \
                    close_time, description, open_time, isOpen, \
                    accepting_hours, is_accepting_24hr, delivery_hours, \
                    zipcode',
            )

            result = []

            for kitchen in kitchens['Items']:
                kitchen['open_time']['S'] = formateTime(kitchen['open_time']['S'])
                kitchen['close_time']['S'] = formateTime(kitchen['close_time']['S'])

                if kitchen['isOpen']['BOOL'] == True:
                    result.insert(0, kitchen)
                else:
                    result.append(kitchen)

            response['message'] = 'Request successful'
            response['result'] = result
            return response, 200
        except:
            raise BadRequest('Request failed. Please try again later.')


class Kitchen(Resource):
    def get(self, kitchen_id):
        kitchen = db.scan(TableName='kitchens',
            FilterExpression='kitchen_id = :val',
            ExpressionAttributeValues={
                ':val': {'S': kitchen_id}
            }
        )
        if (kitchen.get('Items') == []):
            return "Kitchen not found.", 404
        return kitchen, 200

api.add_resource(Kitchens, '/api/v1/kitchens')
api.add_resource(Kitchen, '/api/v1/kitchen/<string:kitchen_id>')

if __name__ == '__main__':
    app.run(host='localhost', port='5000')
