const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const getFormPayloadRequest = (cookie) => {
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
            let UserName = body.slice(start, start + 50)
            UserName = UserName.slice(UserName.indexOf("value:"))
            UserName = UserName.split('\'')[1]

            let formData = {
                'AuthToken': AuthToken,
                'Employee': Employee,
                'UserName': UserName
            }
            return resolve(formData)
        })
    });
}

const getReportHTML = (formPayload) => {
    return new Promise((resolve, reject) => {
        let options = {
            'method': 'GET',
            'url': 'https://vz.merlot.aero/Reports/reportviewerform.aspx',
            formData: {
                'ReportName': '/Crew/rptEmployeeRosterReport',
                'ReturnPDF': 'true',
                'StartDate': '10-01-2023',
                'EndDate': '10-31-2023',
                'Employee': formPayload.Employee,
                'ShowUnpublished': 'false',
                'AuthToken': formPayload.AuthToken,
                'UserName': formPayload.UserName
            }
        };
        request(options, (error, response, body) => {
            if (error)
                console.error('error getcookie:', error);
            return resolve(body)
        })
    });
}
const extractReport = (reportHTML) => {
    const { document } = (new JSDOM(reportHTML)).window;
}

const main = async(cookie) => {
    let fromPayload = await getFormPayloadRequest(cookie)
    let reportHTML = await getReportHTML(fromPayload)
    let data = extractReport(reportHTML)
    // console.log(report)
    return reportHTML
}

module.exports = {main}