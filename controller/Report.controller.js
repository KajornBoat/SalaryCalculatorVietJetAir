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

const getReportHTML = (date, formPayload) => {
    let from = date.from.split('-')
    let to = date.to.split("-")
    from = from[1] + '-' + from[2] + '-' + from[0]
    to = to[1] + '-' + to[2] + '-' + to[0]
    return new Promise((resolve, reject) => {
        let options = {
            'method': 'GET',
            'url': 'https://vz.merlot.aero/Reports/reportviewerform.aspx',
            formData: {
                'ReportName': '/Crew/rptEmployeeRosterReport',
                'ReturnPDF': 'true',
                'StartDate': from,
                'EndDate': to,
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
    data = {
        head: {
            name: "",
            username: "",
            date: ""
        },
        total: {
            sector: 0,
            days: 0,
            layover: 0,
            flightTimes: {
                hour: 0,
                min: 0
            }

        },
        data: [],
        tableHtml: ""
    }
    const { document } = (new JSDOM(reportHTML)).window;
    //Extract Head
    let head = document.querySelector("body > table > thead").querySelectorAll('table > tbody > tr')
    data.head.name = head[1].getElementsByTagName('td')[0].innerHTML
    data.head.username = head[2].getElementsByTagName('td')[0].innerHTML
    data.head.date = head[2].getElementsByTagName('td')[1].innerHTML

    //Extract Data
    let docBody = document.querySelector("body > table > tbody")
    let docData = docBody.querySelectorAll("td > table > tbody > tr")

    for (let i = 0; i < docData.length; i++) {
        let data_ele = {
            date: "",
            from: "",
            report: "",
            to: '',
            flight_time: "",
            sector: []
        }
        let ele = docData[i].getElementsByTagName('td')
        if (ele.length != 15) continue
        data_ele.date = ele[0].innerHTML + " " + ele[1].innerHTML.slice(0, -2)
        data_ele.from = ele[4].innerHTML
        data_ele.report = ele[5].innerHTML.slice(0, -3)
        data_ele.to = ele[6].innerHTML
        data_ele.flight_time = ele[9].innerHTML

        let sectors = ele[13].innerHTML.split(" <br>\n")
        for (let j in sectors) {
            if (sectors[j].search('Accom') != -1) continue
            data_ele.sector.push(sectors[j])
        }
        if (data_ele.sector[0] == '') data_ele.sector = []
        data.data.push(data_ele)
    }

    //Extract Total
    let total_flight_times = docBody.querySelectorAll("td > table > tfoot > tr > td")[9].innerHTML.split(':')
    data.total.flightTimes.hour = parseInt(total_flight_times[0])
    data.total.flightTimes.min = parseInt(total_flight_times[1])

    let total_days = 0
    let total_sector = 0
    let layover = 0
    let checkLayover = false

    for (let i in data.data) {
        total_sector += data.data[i].sector.length
        if (data.data[i].sector.length > 0) total_days += 1
        //Layover
        if (data.data[i].to != '' && data.data[i].from != '' && checkLayover) {
            data.total.layover += layover
            layover = 0
            checkLayover = false
        }
        if (data.data[i].to != '') {
            layover = 0
            checkLayover = true
        }
        if (checkLayover) layover += 1
    }
    data.total.sector = total_sector
    data.total.days = total_days
    data.tableHtml = docBody.querySelector('td > table').innerHTML

    return data

}
const getDataJson = async (date, cookie) => {
    let fromPayload = await getFormPayloadRequest(cookie)
    let reportHTML = await getReportHTML(date, fromPayload)
    let dataJson = extractReport(reportHTML)
    return dataJson
}
const main = async (cookie) => {
    let fromPayload = await getFormPayloadRequest(cookie)
    let reportHTML = await getReportHTML(fromPayload)
    // let data = extractReport(reportHTML)
    // console.log(report)
    return reportHTML
}

module.exports = { main, extractReport, getDataJson }