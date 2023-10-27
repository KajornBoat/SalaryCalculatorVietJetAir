const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const data = {
    'UserName': 'tvj2019',
    'Password': 'Miw@2019',
}

const login = () => {
    return new Promise((resolve, reject) => {
        let options = {
            'method': 'POST',
            'url': 'https://vzportal.merlot.aero/common/Account/LogOn?app=Crew&ReturnUrl=%2fCrew/',

            formData: {
                // '__RequestVerificationToken': 'ZWnigYD_6dJNF5Hw77vzYpdEI_pMxYuOCYyWqrABtKLtoGRr5AHr8iCY8aZUEPa0jMHyeO7CVXHtp8QhzBjhuYEeAh41',
                'UserName': data.UserName,
                'Password': data.Password,
                'ddlLanguage': 'en'
            }
        };

        request(options, (error, response, body) => {
            if (error)
                console.error('error login:', error);
            // console.log('statusCode:', response && response.statusCode);
            // console.log(body)

            let start = body.indexOf("param=") + 6;
            let end = body.indexOf("\>here<");
            let param = body.slice(start, end)

            let cookies = response.headers['set-cookie']
            let Cookie = ""
            for (let index in cookies) {
                Cookie += cookies[index].split(";")[0]
                if (index < cookies.length - 1)
                    Cookie += "; "
            }

            let result = {
                "param": param,
                "cookie": Cookie
            }
            return resolve(result)
        })
    })
}
const getFormData = (cookie) => {
    return new Promise((resolve, reject) => {
        let options = {
            'method': 'GET',
            'url': 'https://vzportal.merlot.aero/Crew/Home/ReportForm/1?X-Requested-With=XMLHttpRequest',
            'headers': {
                'Cookie': cookie
            }
        };
        request(options, (error, response, body) => {
            if (error)
                console.error('error getcookie:', error);

            let start = body.indexOf("{ key: 'AuthToken'")
            let end = body.indexOf("{ key: 'UserName")
            let AuthToken = body.slice(start, end)
            AuthToken = AuthToken.slice(AuthToken.indexOf("value:"))
            AuthToken = AuthToken.split('\'')[1]

            start = body.indexOf("{ key: 'Employee'")
            end = body.indexOf("{ key: 'ShowUnpublished'")
            let Employee = body.slice(start, end)
            Employee = Employee.slice(Employee.indexOf("value:"))
            Employee = Employee.split('\'')[1]

            start = body.indexOf("{ key: 'UserName'")
            let UserName = body.slice(start, start+50)
            UserName = UserName.slice(UserName.indexOf("value:"))
            UserName = UserName.split('\'')[1]

            let formData = {
                'AuthToken':AuthToken,
                'Employee' : Employee,
                'UserName': UserName
            }
            return resolve(formData)
        })
    });
};
const getReport = (formData) => {
    return new Promise((resolve, reject) => {
        let options = {
            'method': 'GET',
            'url': 'https://vz.merlot.aero/Reports/reportviewerform.aspx',
            formData: {
                'ReportName': '/Crew/rptEmployeeRosterReport',
                'ReturnPDF': 'true',
                'StartDate': '10-01-2023',
                'EndDate': '10-31-2023',
                'Employee': formData.Employee,
                'ShowUnpublished': 'false',
                'AuthToken': formData.AuthToken,
                'UserName': formData.UserName
              }
        };
        request(options, (error, response, body) => {
            if (error)
                console.error('error getcookie:', error);
            return resolve(body)
        })
    });
}
const getSectorLists = (html) => {
    let result = {
        "totalFlightTimes": 0,
        "sectorNum": 0,
        "totalDay" : 0,
        "sectorList": []
    }
    const { document } = (new JSDOM(html)).window;
    
    // let flight_time_texts = document.evaluate('/html/body/table/tbody/tr/td/table/tfoot/tr/td', document, null, XPathResult.ANY_TYPE, null)
    let table_lists = document.querySelectorAll('td > table')
    let dataList = table_lists[1].getElementsByTagName('tbody')[0].getElementsByTagName('tr')
    let flight_time_text = table_lists[1].getElementsByTagName('tfoot')[0].getElementsByTagName('td')[9].innerHTML.split(':')
    result.totalFlightTimes = [parseInt(flight_time_text[0]),parseInt(flight_time_text[1])]

    for(let index = 0; index < dataList.length; index++){
        
        let tdlists = dataList[index].getElementsByTagName('td')
        if(tdlists.length != 15) continue
        let sectorList = tdlists[13].innerHTML.split('<br>\n')

        if(sectorList.length < 2) continue
        let sectorData = ''
        for(let i in sectorList){
            if(sectorList[i].search('Accom') != -1)
                    continue
            result.sectorNum += 1
            // console.log(sectorList[i])
            sectorData += sectorList[i]
            sectorData += '\n'
        }
        sectorData = sectorData.slice(0,-2)
        result.sectorList.push(sectorData)
    }
    result.totalDay = result.sectorList.length
    console.log(result)

    return result
}

const getReportResult = (html) => {
    const { document } = (new JSDOM(html)).window;
    let tfoot = document.querySelectorAll('body > table')[0]
    // tfoot.parentElement.removeChild(tfoot)
    document.removeChild(tfoot)
    return document.documentElement.innerHTML
}


const main = async () => {
    console.log("test controller")

    let res_login = await login()
    let formData = await getFormData(res_login.cookie)
    let reportHTML = await getReport(formData)
    // let data = getSectorLists(reportHTML)
    // console.log(report)

    return getReportResult(reportHTML)

    // return new Promise((resolve, reject) => {
    //     let options = {
    //         'method': 'GET',
    //         'url': 'https://vzportal.merlot.aero/Crew/?param=' + res_login.param,
    //         'headers': {
    //             'Cookie': res_login.cookie
    //         }
    //     };
    //     request(options, (error, response, body) => {
    //         if (error)
    //             console.error('error getcookie:', error);
    //         // console.log('statusCode:', response && response.statusCode);
    //         return resolve(body)
    //     })
    // })

}
module.exports = main 