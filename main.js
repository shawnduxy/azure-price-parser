const _ = require('underscore')
const async = require('async')
const YQL = require('yql')
const builder = require('xmlbuilder')

const instanceTypeMap = {
  'A0-4 – Basic A0': 'Basic_A0',
  'A0-4 – Basic A1': 'Basic_A1',
  'A0-4 – Basic A2': 'Basic_A2',
  'A0-4 – Basic A3': 'Basic_A3',
  'A0-4 – Basic A4': 'Basic_A4',
  'Av2 Standard A1 v2': 'Standard_A1_v2',
  'Av2 Standard A2 v2': 'Standard_A2_v2',
  'Av2 Standard A4 v2': 'Standard_A4_v2',
  'Av2 Standard A8 v2': 'Standard_A8_v2',
  'Av2 Standard A2m v2': 'Standard_A2m_v2',
  'Av2 Standard A4m v2': 'Standard_A4m_v2',
  'Av2 Standard A8m v2': 'Standard_A8m_v2',
  'D2-5 – v2 Promo - Limited-time D2 v2 Promo': 'Standard_D2_v2_Promo',
  'D2-5 – v2 Promo - Limited-time D3 v2 Promo': 'Standard_D3_v2_Promo',
  'D2-5 – v2 Promo - Limited-time D4 v2 Promo': 'Standard_D4_v2_Promo',
  'D2-5 – v2 Promo - Limited-time D5 v2 Promo': 'Standard_D5_v2_Promo',
  'D1-5 – v2-Latest Generation D1 v2': 'Standard_D1_v2',
  'D1-5 – v2-Latest Generation D2 v2': 'Standard_D2_v2',
  'D1-5 – v2-Latest Generation D3 v2': 'Standard_D3_v2',
  'D1-5 – v2-Latest Generation D4 v2': 'Standard_D4_v2',
  'D1-5 – v2-Latest Generation D5 v2': 'Standard_D5_v2',
  'F Series F1': 'Standard_F1',
  'F Series F2': 'Standard_F2',
  'F Series F4': 'Standard_F4',
  'F Series F8': 'Standard_F8',
  'F Series F16': 'Standard_F16',
  'D11-14 – v2 Promo - Limited-time D11 v2 Promo': 'Standard_D11_v2_Promo',
  'D11-14 – v2 Promo - Limited-time D12 v2 Promo': 'Standard_D12_v2_Promo',
  'D11-14 – v2 Promo - Limited-time D13 v2 Promo': 'Standard_D13_v2_Promo',
  'D11-14 – v2 Promo - Limited-time D14 v2 Promo': 'Standard_D14_v2_Promo',
  'D11-15 – v2 D11 v2': 'Standard_D11_v2',
  'D11-15 – v2 D12 v2': 'Standard_D12_v2',
  'D11-15 – v2 D13 v2': 'Standard_D13_v2',
  'D11-15 – v2 D14 v2': 'Standard_D14_v2',
  'D11-15 – v2 D15 v2': 'Standard_D15_v2',
  'G Series G1': 'Standard_G1',
  'G Series G2': 'Standard_G2',
  'G Series G3': 'Standard_G3',
  'G Series G4': 'Standard_G4',
  'G Series G5': 'Standard_G5',
  'L Series L4': 'Standard_L4s',
  'L Series L8': 'Standard_L8s',
  'L Series L16': 'Standard_L16s',
  'L Series L32': 'Standard_L32s',
  'NC Series NC6': 'Standard_NC6',
  'NC Series NC12': 'Standard_NC12',
  'NC Series NC24': 'Standard_NC24',
  'NC Series NC24r': 'Standard_NC24r',
  'NV Series NV6': 'Standard_NV6',
  'NV Series NV12': 'Standard_NV12',
  'NV Series NV24': 'Standard_NV24',
  'H Series H8': 'Standard_H8',
  'H Series H8m': 'Standard_H8m',
  'H Series H16': 'Standard_H16',
  'H Series H16m': 'Standard_H16m',
  'H Series H16r': 'Standard_H16r',
  'H Series H16mr': 'Standard_H16mr',
  'D1-4 – v1 D1': 'Standard_D1',
  'D1-4 – v1 D2': 'Standard_D2',
  'D1-4 – v1 D3': 'Standard_D3',
  'D1-4 – v1 D4': 'Standard_D4',
  'A0-7 – Standard A0': 'Standard_A0',
  'A0-7 – Standard A1': 'Standard_A1',
  'A0-7 – Standard A2': 'Standard_A2',
  'A0-7 – Standard A3': 'Standard_A3',
  'A0-7 – Standard A4': 'Standard_A4',
  'A0-7 – Standard A5': 'Standard_A5',
  'A0-7 – Standard A6': 'Standard_A6',
  'A0-7 – Standard A7': 'Standard_A7',
  'D11-14 – v1 D11': 'Standard_D11',
  'D11-14 – v1 D12': 'Standard_D12',
  'D11-14 – v1 D13': 'Standard_D13',
  'D11-14 – v1 D14': 'Standard_D14',
  'A8-11 A8': 'Standard_A8',
  'A8-11 A9': 'Standard_A9',
  'A8-11 A10': 'Standard_A10',
  'A8-11 A11': 'Standard_A11'
}

if (process.argv.length != 3 || (process.argv[2] !== 'linux' && process.argv[2] !== 'windows' && process.argv[2] !== 'linux-previous' && process.argv[2] !== 'windows-previous' && process.argv[2] !== 'storage-managed' && process.argv[2] !== 'storage-unmanaged' && process.argv[2] != 'storage-blob')) {
  console.log("Usage: node main.js linux|windows|linux-previous|windows-previous|storage-managed|storage-unmanaged|storage-blob")
  return
}

let xml = builder.create('InstanceTypeCosts')

if (process.argv[2] === 'storage-managed' || process.argv[2] === 'storage-unmanaged') {
  let managedUrl = "https://azure.microsoft.com/en-us/pricing/details/managed-disks/"
  let unmanagedUrl = "https://azure.microsoft.com/en-us/pricing/details/storage/unmanaged-disks/"
  if (process.argv[2] === 'storage-managed') {
    var url = managedUrl
  } else {
    var url = unmanagedUrl
  }

  let regionQuery = new YQL(`select * from html where url="${url}" and xpath="//select[@id=\'region-selector\']/optgroup/option"`)
  let premiumQuery = new YQL(`select * from html where url="${managedUrl}" and xpath="//div[@class=\'sd-table-container\' and @data-target=\'Premium Managed Disks\']/table/tbody"`)
  let managedStandardQuery = new YQL(`select * from html where url="${url}" and xpath="//div[@class=\'sd-table-container\' and @data-target=\'Standard Managed Disks\']/table/tbody"`)
  let unmanagedStandardQuery = new YQL(`select * from html where url="${url}" and xpath="//div[@class=\'sd-table-container\' and @data-target=\'Standard Unmanaged Disks & Page blobs\']/table/tbody"`)

  async.waterfall([
    cb => {
      // query regions
      regionQuery.exec(cb)
    },
    (result, cb) => {
      // save regions
      let regions = {}
      _.each(result.query.results.option, option => {
        regions[option.value] = option.content
      })
      // query premium storage price - this is same for both managed and unmanaged storage
      premiumQuery.exec((err, data) => {
        cb(err, regions, data)
      })
    },
    (regions, data, cb) => {
      // save premium storage price - disk size can be 128G, 512G, and 1024G
      let priceByRegion = {}
      let tr = data.query.results.tbody.tr[1]
      let prices128 = JSON.parse(tr.td[1].span['data-amount']).regional
      let prices512 = JSON.parse(tr.td[2].span['data-amount']).regional
      let prices1024 = JSON.parse(tr.td[3].span['data-amount']).regional
      _.each(prices128, (price, region) => {
        if (!priceByRegion[region]) {
          priceByRegion[region] = {
            '128': 0,
            '512': 0,
            '1024': 0
          }
        }
        priceByRegion[region]['128'] = price
      })
      _.each(prices512, (price, region) => {
        priceByRegion[region]['512'] = price
      })
      _.each(prices1024, (price, region) => {
        priceByRegion[region]['1024'] = price
      })
      cb(null, regions, priceByRegion)
    },
    (regions, priceByRegion, cb) => {
      // output to XML
      _.each(priceByRegion, (prices, region) => {
        _.each(prices, (price, size) => {
          xml.ele('StorageCost', {
            region: regions[region],
            diskType: 'SSD',
            diskSize: size,
            costPerDisk: price
          })
        })
      })
      cb(null, regions)
    },
    (regions, cb) => {
      if (process.argv[2] === 'storage-managed') {
        // query managed standard storage price
        managedStandardQuery.exec((err, data) => {
          cb(err, regions, data, true)
        })
      } else {
        // query unmanaged standard storage price
        unmanagedStandardQuery.exec((err, data) => {
          cb(err, regions, data, false)
        })
      }
    },
    (regions, data, managed, cb) => {
      if (managed) {
        // save managed standard storage price - disk size can be 32G, 64G, 128G, 512G, and 1024G
        let priceByRegion = {}
        let tr = data.query.results.tbody.tr[1]
        let prices32 = JSON.parse(tr.td[1].span['data-amount']).regional
        let prices64 = JSON.parse(tr.td[2].span['data-amount']).regional
        let prices128 = JSON.parse(tr.td[3].span['data-amount']).regional
        let prices512 = JSON.parse(tr.td[4].span['data-amount']).regional
        let prices1024 = JSON.parse(tr.td[5].span['data-amount']).regional
        _.each(prices32, (price, region) => {
          if (!priceByRegion[region]) {
            priceByRegion[region] = {
              '32': 0,
              '64': 0,
              '128': 0,
              '512': 0,
              '1024': 0
            }
          }
          priceByRegion[region]['32'] = price
        })
        _.each(prices64, (price, region) => {
          priceByRegion[region]['64'] = price
        })
        _.each(prices128, (price, region) => {
          priceByRegion[region]['128'] = price
        })
        _.each(prices512, (price, region) => {
          priceByRegion[region]['512'] = price
        })
        _.each(prices1024, (price, region) => {
          priceByRegion[region]['1024'] = price
        })
        cb(null, regions, priceByRegion, true)
      } else {
        // save unmanaged standard storage price - replication type can be LRS, GRS, and RA-GRS
        let priceByRegion = {}
        let tr = data.query.results.tbody.tr[0]
        let pricesLrs = JSON.parse(tr.td[1].span['data-amount']).regional
        let pricesGrs = JSON.parse(tr.td[2].span['data-amount']).regional
        let pricesRaGrs = JSON.parse(tr.td[3].span['data-amount']).regional
        _.each(pricesLrs, (price, region) => {
          if (!priceByRegion[region]) {
            priceByRegion[region] = {
              'LRS': 0,
              'GRS': 0,
              'RA_GRS': 0
            }
          }
          priceByRegion[region]['LRS'] = price
        })
        _.each(pricesGrs, (price, region) => {
          priceByRegion[region]['GRS'] = price
        })
        _.each(pricesRaGrs, (price, region) => {
          priceByRegion[region]['RA_GRS'] = price
        })
        cb(null, regions, priceByRegion, false)
      }
    },
    (regions, priceByRegion, managed, cb) => {
      // output to XML
      if (managed) {
        _.each(priceByRegion, (prices, region) => {
          _.each(prices, (price, size) => {
            xml.ele('StorageCost', {
              region: regions[region],
              datastoreType: 'ARM_MANAGED_STORAGE',
              diskType: 'HDD',
              diskSize: size,
              costPerDisk: price * 2 // IMPORTANT: double the promotional price
            })
          })
        })
        cb()
      } else {
        _.each(priceByRegion, (prices, region) => {
          _.each(prices, (price, replicationType) => {
            xml.ele('StorageCost', {
              region: regions[region],
              datastoreType: 'ARM_STORAGE',
              diskType: 'HDD',
              replicationType: replicationType,
              costPerGB: price
            })
          })
        })
        cb()
      }
    },
    cb => {
      let result = xml.end({
        pretty: true
      })
      cb(null, result)
    }
  ], (err, result) => {
    if (err) {
      console.log('Error: ' + err)
    } else {
      console.log(result)
    }
  })
} else if (process.argv[2] === 'storage-blob') {
  let url = 'https://azure.microsoft.com/en-ca/pricing/details/storage/blobs/'
  let regionQuery = new YQL(`select * from html where url="${url}" and xpath="//select[@id=\'region-selector\']/optgroup/option"`)
  let priceQuery = new YQL(`select * from html where url="${url}" and xpath="//div[@class=\'sd-table-container\' and @data-target=\'Storage Prices\']/table/tbody"`)

  async.waterfall([
    cb => {
      // query regions
      regionQuery.exec(cb)
    },
    (result, cb) => {
      // save regions
      let regions = {}
      _.each(result.query.results.option, option => {
        regions[option.value] = option.content
      })
      // query premium storage price - this is same for both managed and unmanaged storage
      priceQuery.exec((err, data) => {
        cb(err, regions, data)
      })
    },
    (regions, data, cb) => {
      // save blob storage price - replication type can be LRS-COOL, LRS-HOT, GRS-COOL, GRS-HOT, RA_GRS-COOL, and RA_GRS-HOT
      let priceByRegion = {}
      let tr = data.query.results.tbody.tr[0]
      let pricesLrsCool = JSON.parse(tr.td[1].span['data-amount']).regional
      let pricesLrsHot = JSON.parse(tr.td[2].span['data-amount']).regional
      let pricesGrsCool = JSON.parse(tr.td[3].span['data-amount']).regional
      let pricesGrsHot = JSON.parse(tr.td[4].span['data-amount']).regional
      let pricesRaGrsCool = JSON.parse(tr.td[5].span['data-amount']).regional
      let pricesRaGrsHot = JSON.parse(tr.td[6].span['data-amount']).regional
      _.each(pricesLrsCool, (price, region) => {
        if (!priceByRegion[region]) {
          priceByRegion[region] = {
            'LRS-COOL': 0,
            'LRS-HOT': 0,
            'GRS-COOL': 0,
            'GRS-HOT': 0,
            'RA_GRS-COOL': 0,
            'RA_GRS-HOT': 0
          }
        }
        priceByRegion[region]['LRS-COOL'] = price
      })
      _.each(pricesLrsHot, (price, region) => {
        priceByRegion[region]['LRS-HOT'] = price
      })
      _.each(pricesGrsCool, (price, region) => {
        priceByRegion[region]['GRS-COOL'] = price
      })
      _.each(pricesGrsHot, (price, region) => {
        priceByRegion[region]['GRS-HOT'] = price
      })
      _.each(pricesRaGrsCool, (price, region) => {
        priceByRegion[region]['RA_GRS-COOL'] = price
      })
      _.each(pricesRaGrsHot, (price, region) => {
        priceByRegion[region]['RA_GRS-HOT'] = price
      })
      cb(null, regions, priceByRegion, false)
    },
    (regions, priceByRegion, managed, cb) => {
      // output to XML
      _.each(priceByRegion, (prices, region) => {
        _.each(prices, (price, replicationType) => {
          xml.ele('StorageCost', {
            region: regions[region],
            datastoreType: 'ARM_BLOB_STORAGE',
            diskType: 'HDD',
            replicationType: replicationType,
            costPerGB: price
          })
        })
      })
      cb()
    },
    cb => {
      let result = xml.end({
        pretty: true
      })
      cb(null, result)
    }
  ], (err, result) => {
    if (err) {
      console.log('Error: ' + err)
    } else {
      console.log(result)
    }
  })
} else {
  let url = "https://azure.microsoft.com/en-us/pricing/details/virtual-machines/" + process.argv[2] + "/"

  let os = process.argv[2].startsWith('linux') ? 'Linux' : 'Microsoft Windows'

  let regionQuery = new YQL(`select * from html where url="${url}" and xpath="//select[@id=\'region-selector\']/optgroup/option"`)
  let priceQuery = new YQL(`select data-target, table.tbody from html where url="${url}" and xpath="//div[@class=\'toggled\']/div/div[@class=\'sd-table-container\']"`)

  async.waterfall([
    cb => {
      regionQuery.exec(cb)
    },
    (result, cb) => {
      let regions = {}
      _.each(result.query.results.option, option => {
        regions[option.value] = option.content
      })
      priceQuery.exec((err, data) => {
        cb(err, regions, data)
      })
    },
    (regions, data, cb) => {
      let priceByRegion = {}
      _.each(data.query.results.div, div => {
        let instanceFamily = div['data-target']
        _.each(div.table.tbody.tr, tr => {
          let instanceType = instanceFamily + ' ' + tr.td[0].trim()
          let prices = JSON.parse(tr.td[tr.td.length - 1].span["data-amount"]).regional
          _.each(prices, (price, region) => {
            if (!priceByRegion[region]) {
              priceByRegion[region] = {}
            }
            priceByRegion[region][instanceType] = price
          })
        })
      })
      cb(null, regions, priceByRegion)
    },
    (regions, priceByRegion, cb) => {
      _.each(priceByRegion, (prices, region) => {
        _.each(prices, (price, instanceType) => {
          if (!instanceTypeMap[instanceType]) {
            console.log('Unknown instance type: ' + instanceType)
            return
          }
          xml.ele('InstanceTypeCost', {
            region: regions[region],
            guestOsType: os,
            instanceType: instanceTypeMap[instanceType]
          }, price)
        })
      })
      let result = xml.end({
        pretty: true
      })
      cb(null, result)
    }
  ], (err, result) => {
    if (err) {
      console.log('Error: ' + err)
    } else {
      console.log(result)
    }
  })
}
