function remind_DTP() {

    var today = new Date();
    var dayOfWeek = today.getDay();

    if (dayOfWeek != 6 && dayOfWeek != 0) {
      var image_DTP = init230606('https://www.bursamalaysia.com/market_information/market_statistic/securities', 1350, 1750, 0, 0);
      sendPhoto(-1001519431910, image_DTP);
    }
  
}

function remind_QER() {

    var today = new Date();
    var dayOfWeek = today.getDay();

    if (dayOfWeek != 6 && dayOfWeek != 0) {
      var image_QER = init230606('https://www.malaysiastock.biz/Latest-Announcement.aspx', 500, 2500, 0, 350);
      sendPhoto(-1001519431910, image_QER);
    }
  
}

///////////////////////////////////////////////////////////////////////////

function init230606(url_location, cord_x, cord_y, cord_l, cord_r) {
    /*
           @Scope: main function
           
    */    
    // Source IMG URL
    // Add logic to read from spreadsheets
    var source = url_location;
    var crop_x = cord_x;
    var crop_y = cord_y;
    var crop_l = cord_l;
    var crop_r = cord_r;
    return new Promise((resolve, reject) => {
      var uri = convert_to_jpg(source, crop_x, crop_y, crop_l, crop_r);                // Converted file URL
      resolve(uri);
    });
    //console.log(uri);
    //return uri
    // SaveToDrive(uri)                              // Saving it to Google Drive
}


function convert_to_jpg(image_url, cord_x, cord_y, cord_l, cord_r) {
    /*
           @Scope: Function does API request to crop images online
           @params:
                -> image_url: string
           @returns: string <= comma separated final urls
           @example: convert_to_jpg('https://cdn.online-convert.com/example-file/raster%20image/jpg/example_small.jpg')
    */
    var end_point_uri = 'https://api2.online-convert.com/jobs';
    var token = 'GETYOUROWN';
    var request_headers = {
        "Content-Type": "text/plain",
        "x-oc-api-key": token,
    };
  
    var request = build_request_payload(image_url, cord_x, cord_y, cord_l, cord_r);
    var response = do_api_call(method='POST', url=end_point_uri, headers=request_headers, data=request);
    var content_text = JSON.parse(response.getContentText("UTF-8"));
    var req_id = content_text['id'];
    var job_url = end_point_uri + '/' + req_id
    var poll_job, job_status, status_code, outputs, file;
    while(true) {
        poll_job = do_api_call(method='GET', url=job_url, headers={"x-oc-api-key": token});
        job_status = JSON.parse(poll_job.getContentText("UTF-8"));
        status_code = job_status['status']['code'];
        if(status_code == 'completed') {
            outputs = job_status['output'];
            var uri_list = new Array();
            for (var i=0; i < outputs['length']; i++) {
                 file = outputs[i];
                 uri_list[i] = file['uri'];
            }
            break;
        };
    }
    return uri_list.join(',');
}


function do_api_call(method, url, headers, data=null) {
    /*
          Utility method
          Scope: Making API request
          @params:
              -> method: string  # GET/POST/PATCH/UPDATE
              -> url: string
              -> headers: JSON
              -> data: JSON
    */
    var requestOptions = {
        'method': method,
        'url': url,
        'headers': headers,
        'redirect': 'follow'
    };
    if(data) {
        requestOptions['payload'] = JSON.stringify(data)
    };
    return UrlFetchApp.fetch(url, requestOptions);
}


function SaveToDrive(url, file_name=null) {
    /*
          Utility method
          Scope: Saving file into Drive
          @params:
              -> url: string
              -> file_name: string
    */
    var blob = UrlFetchApp.fetch(url).getBlob();
    var imgfile = DriveApp.createFile(blob);
    if (file_name) { imgfile.setName(file_name); };
    blob = null;
}


function build_request_payload(image_url, cord_x, cord_y, cord_l, cord_r) {
    /*
          Utility method
          @params: image_url: string
          @returns: JSON
    */
    // NOTE:: implemented to process single URL
    // API supports multiple file conversion in one go,
    // Modify script to process. You can send list of source image URLs and conversion
    // parameters to generate request payload
    var request = {
        "input": [{
            "type": "remote",
            "source": image_url
        }],
        "conversion": [{
            "category": "image",
            "target": "jpg",
            "options": {
              "crop_top" : cord_x,
              "crop_bottom" : cord_y,
              "crop_left" : cord_l,
              "crop_right" : cord_r
            }
        }]
    };
    return request;
}
