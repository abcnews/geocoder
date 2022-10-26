var __GEOCODE__ = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __reExport = (target, module, copyDefault, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toESM = (module, isNodeMode) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", !isNodeMode && module && module.__esModule ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };
  var __toCommonJS = /* @__PURE__ */ ((cache) => {
    return (module, temp) => {
      return cache && cache.get(module) || (temp = __reExport(__markAsModule({}), module, 1), cache && cache.set(module, temp), temp);
    };
  })(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

  // node_modules/latlon-geohash/latlon-geohash.js
  var require_latlon_geohash = __commonJS({
    "node_modules/latlon-geohash/latlon-geohash.js"(exports, module) {
      "use strict";
      var Geohash2 = {};
      Geohash2.base32 = "0123456789bcdefghjkmnpqrstuvwxyz";
      Geohash2.encode = function(lat, lon, precision) {
        if (typeof precision == "undefined") {
          for (var p = 1; p <= 12; p++) {
            var hash = Geohash2.encode(lat, lon, p);
            var posn = Geohash2.decode(hash);
            if (posn.lat == lat && posn.lon == lon)
              return hash;
          }
          precision = 12;
        }
        lat = Number(lat);
        lon = Number(lon);
        precision = Number(precision);
        if (isNaN(lat) || isNaN(lon) || isNaN(precision))
          throw new Error("Invalid geohash");
        var idx = 0;
        var bit = 0;
        var evenBit = true;
        var geohash = "";
        var latMin = -90, latMax = 90;
        var lonMin = -180, lonMax = 180;
        while (geohash.length < precision) {
          if (evenBit) {
            var lonMid = (lonMin + lonMax) / 2;
            if (lon >= lonMid) {
              idx = idx * 2 + 1;
              lonMin = lonMid;
            } else {
              idx = idx * 2;
              lonMax = lonMid;
            }
          } else {
            var latMid = (latMin + latMax) / 2;
            if (lat >= latMid) {
              idx = idx * 2 + 1;
              latMin = latMid;
            } else {
              idx = idx * 2;
              latMax = latMid;
            }
          }
          evenBit = !evenBit;
          if (++bit == 5) {
            geohash += Geohash2.base32.charAt(idx);
            bit = 0;
            idx = 0;
          }
        }
        return geohash;
      };
      Geohash2.decode = function(geohash) {
        var bounds = Geohash2.bounds(geohash);
        var latMin = bounds.sw.lat, lonMin = bounds.sw.lon;
        var latMax = bounds.ne.lat, lonMax = bounds.ne.lon;
        var lat = (latMin + latMax) / 2;
        var lon = (lonMin + lonMax) / 2;
        lat = lat.toFixed(Math.floor(2 - Math.log(latMax - latMin) / Math.LN10));
        lon = lon.toFixed(Math.floor(2 - Math.log(lonMax - lonMin) / Math.LN10));
        return { lat: Number(lat), lon: Number(lon) };
      };
      Geohash2.bounds = function(geohash) {
        if (geohash.length === 0)
          throw new Error("Invalid geohash");
        geohash = geohash.toLowerCase();
        var evenBit = true;
        var latMin = -90, latMax = 90;
        var lonMin = -180, lonMax = 180;
        for (var i = 0; i < geohash.length; i++) {
          var chr = geohash.charAt(i);
          var idx = Geohash2.base32.indexOf(chr);
          if (idx == -1)
            throw new Error("Invalid geohash");
          for (var n = 4; n >= 0; n--) {
            var bitN = idx >> n & 1;
            if (evenBit) {
              var lonMid = (lonMin + lonMax) / 2;
              if (bitN == 1) {
                lonMin = lonMid;
              } else {
                lonMax = lonMid;
              }
            } else {
              var latMid = (latMin + latMax) / 2;
              if (bitN == 1) {
                latMin = latMid;
              } else {
                latMax = latMid;
              }
            }
            evenBit = !evenBit;
          }
        }
        var bounds = {
          sw: { lat: latMin, lon: lonMin },
          ne: { lat: latMax, lon: lonMax }
        };
        return bounds;
      };
      Geohash2.adjacent = function(geohash, direction) {
        geohash = geohash.toLowerCase();
        direction = direction.toLowerCase();
        if (geohash.length === 0)
          throw new Error("Invalid geohash");
        if ("nsew".indexOf(direction) == -1)
          throw new Error("Invalid direction");
        var neighbour = {
          n: ["p0r21436x8zb9dcf5h7kjnmqesgutwvy", "bc01fg45238967deuvhjyznpkmstqrwx"],
          s: ["14365h7k9dcfesgujnmqp0r2twvyx8zb", "238967debc01fg45kmstqrwxuvhjyznp"],
          e: ["bc01fg45238967deuvhjyznpkmstqrwx", "p0r21436x8zb9dcf5h7kjnmqesgutwvy"],
          w: ["238967debc01fg45kmstqrwxuvhjyznp", "14365h7k9dcfesgujnmqp0r2twvyx8zb"]
        };
        var border = {
          n: ["prxz", "bcfguvyz"],
          s: ["028b", "0145hjnp"],
          e: ["bcfguvyz", "prxz"],
          w: ["0145hjnp", "028b"]
        };
        var lastCh = geohash.slice(-1);
        var parent = geohash.slice(0, -1);
        var type = geohash.length % 2;
        if (border[direction][type].indexOf(lastCh) != -1 && parent !== "") {
          parent = Geohash2.adjacent(parent, direction);
        }
        return parent + Geohash2.base32.charAt(neighbour[direction][type].indexOf(lastCh));
      };
      Geohash2.neighbours = function(geohash) {
        return {
          "n": Geohash2.adjacent(geohash, "n"),
          "ne": Geohash2.adjacent(Geohash2.adjacent(geohash, "n"), "e"),
          "e": Geohash2.adjacent(geohash, "e"),
          "se": Geohash2.adjacent(Geohash2.adjacent(geohash, "s"), "e"),
          "s": Geohash2.adjacent(geohash, "s"),
          "sw": Geohash2.adjacent(Geohash2.adjacent(geohash, "s"), "w"),
          "w": Geohash2.adjacent(geohash, "w"),
          "nw": Geohash2.adjacent(Geohash2.adjacent(geohash, "n"), "w")
        };
      };
      if (typeof module != "undefined" && module.exports)
        module.exports = Geohash2;
    }
  });

  // node_modules/metaphone/index.js
  var require_metaphone = __commonJS({
    "node_modules/metaphone/index.js"(exports, module) {
      "use strict";
      module.exports = metaphone2;
      var sh = "X";
      var th = "0";
      function metaphone2(value) {
        var phonized = "";
        var index = 0;
        var skip;
        var next;
        var current;
        var prev;
        function phonize(characters) {
          phonized += characters;
        }
        function at(offset) {
          return value.charAt(index + offset).toUpperCase();
        }
        function atFactory(offset) {
          return function() {
            return at(offset);
          };
        }
        value = String(value || "");
        if (!value) {
          return "";
        }
        next = atFactory(1);
        current = atFactory(0);
        prev = atFactory(-1);
        while (!alpha(current())) {
          if (!current()) {
            return "";
          }
          index++;
        }
        switch (current()) {
          case "A":
            if (next() === "E") {
              phonize("E");
              index += 2;
            } else {
              phonize("A");
              index++;
            }
            break;
          case "G":
          case "K":
          case "P":
            if (next() === "N") {
              phonize("N");
              index += 2;
            }
            break;
          case "W":
            if (next() === "R") {
              phonize(next());
              index += 2;
            } else if (next() === "H") {
              phonize(current());
              index += 2;
            } else if (vowel(next())) {
              phonize("W");
              index += 2;
            }
            break;
          case "X":
            phonize("S");
            index++;
            break;
          case "E":
          case "I":
          case "O":
          case "U":
            phonize(current());
            index++;
            break;
          default:
            break;
        }
        while (current()) {
          skip = 1;
          if (!alpha(current()) || current() === prev() && current() !== "C") {
            index += skip;
            continue;
          }
          switch (current()) {
            case "B":
              if (prev() !== "M") {
                phonize("B");
              }
              break;
            case "C":
              if (soft(next())) {
                if (next() === "I" && at(2) === "A") {
                  phonize(sh);
                } else if (prev() !== "S") {
                  phonize("S");
                }
              } else if (next() === "H") {
                phonize(sh);
                skip++;
              } else {
                phonize("K");
              }
              break;
            case "D":
              if (next() === "G" && soft(at(2))) {
                phonize("J");
                skip++;
              } else {
                phonize("T");
              }
              break;
            case "G":
              if (next() === "H") {
                if (!(noGhToF(at(-3)) || at(-4) === "H")) {
                  phonize("F");
                  skip++;
                }
              } else if (next() === "N") {
                if (!(!alpha(at(2)) || at(2) === "E" && at(3) === "D")) {
                  phonize("K");
                }
              } else if (soft(next()) && prev() !== "G") {
                phonize("J");
              } else {
                phonize("K");
              }
              break;
            case "H":
              if (vowel(next()) && !dipthongH(prev())) {
                phonize("H");
              }
              break;
            case "K":
              if (prev() !== "C") {
                phonize("K");
              }
              break;
            case "P":
              if (next() === "H") {
                phonize("F");
              } else {
                phonize("P");
              }
              break;
            case "Q":
              phonize("K");
              break;
            case "S":
              if (next() === "I" && (at(2) === "O" || at(2) === "A")) {
                phonize(sh);
              } else if (next() === "H") {
                phonize(sh);
                skip++;
              } else {
                phonize("S");
              }
              break;
            case "T":
              if (next() === "I" && (at(2) === "O" || at(2) === "A")) {
                phonize(sh);
              } else if (next() === "H") {
                phonize(th);
                skip++;
              } else if (!(next() === "C" && at(2) === "H")) {
                phonize("T");
              }
              break;
            case "V":
              phonize("F");
              break;
            case "W":
              if (vowel(next())) {
                phonize("W");
              }
              break;
            case "X":
              phonize("KS");
              break;
            case "Y":
              if (vowel(next())) {
                phonize("Y");
              }
              break;
            case "Z":
              phonize("S");
              break;
            case "F":
            case "J":
            case "L":
            case "M":
            case "N":
            case "R":
              phonize(current());
              break;
          }
          index += skip;
        }
        return phonized;
      }
      function noGhToF(character) {
        character = char(character);
        return character === "B" || character === "D" || character === "H";
      }
      function soft(character) {
        character = char(character);
        return character === "E" || character === "I" || character === "Y";
      }
      function vowel(character) {
        character = char(character);
        return character === "A" || character === "E" || character === "I" || character === "O" || character === "U";
      }
      function dipthongH(character) {
        character = char(character);
        return character === "C" || character === "G" || character === "P" || character === "S" || character === "T";
      }
      function alpha(character) {
        var code = charCode(character);
        return code >= 65 && code <= 90;
      }
      function charCode(character) {
        return char(character).charCodeAt(0);
      }
      function char(character) {
        return String(character).charAt(0).toUpperCase();
      }
    }
  });

  // groups.json
  var require_groups = __commonJS({
    "groups.json"(exports, module) {
      module.exports = ["1MLH", "30PR", "3LK", "4AK", "4T", "AA", "AA0B", "AA0L", "AA0N", "AA0R", "AA0S", "AAB", "AABB", "AABF", "AABH", "AABJ", "AABK", "AABL", "AABM", "AABN", "AABP", "AABR", "AABS", "AABT", "AABW", "AABY", "AAF", "AAFB", "AAFF", "AAFK", "AAFL", "AAFM", "AAFN", "AAFR", "AAFS", "AAFT", "AAFW", "AAFX", "AAHN", "AAHR", "AAJ", "AAJK", "AAJL", "AAJN", "AAJR", "AAJS", "AAJT", "AAK", "AAK0", "AAKB", "AAKF", "AAKH", "AAKK", "AAKL", "AAKM", "AAKN", "AAKP", "AAKR", "AAKS", "AAKT", "AAKW", "AAKX", "AAL", "AAL0", "AALB", "AALF", "AALH", "AALJ", "AALK", "AALL", "AALM", "AALN", "AALP", "AALR", "AALS", "AALT", "AALW", "AALX", "AALY", "AAM", "AAM0", "AAMB", "AAMF", "AAMH", "AAMJ", "AAMK", "AAML", "AAMM", "AAMN", "AAMP", "AAMR", "AAMS", "AAMT", "AAMW", "AAMX", "AAMY", "AAN", "AAN0", "AANB", "AANF", "AANH", "AANJ", "AANK", "AANL", "AANM", "AANN", "AANP", "AANR", "AANS", "AANT", "AANW", "AANX", "AANY", "AAP", "AAPJ", "AAPK", "AAPL", "AAPM", "AAPN", "AAPP", "AAPR", "AAPS", "AAPT", "AAPX", "AAR", "AAR0", "AARB", "AARF", "AARH", "AARJ", "AARK", "AARL", "AARM", "AARN", "AARP", "AARR", "AARS", "AART", "AARW", "AARX", "AARY", "AAS", "AAS0", "AASB", "AASF", "AASH", "AASK", "AASL", "AASM", "AASN", "AASP", "AASR", "AASS", "AAST", "AASW", "AASX", "AAT", "AATB", "AATF", "AATH", "AATJ", "AATK", "AATL", "AATM", "AATN", "AATP", "AATR", "AATS", "AATT", "AATW", "AATX", "AATY", "AAW", "AAWB", "AAWL", "AAWN", "AAWR", "AAWS", "AAWT", "AAX", "AAXB", "AAXF", "AAXK", "AAXL", "AAXM", "AAXN", "AAXP", "AAXR", "AAXS", "AAXT", "AAXW", "AAXY", "AAY", "AAYB", "AAYL", "AAYM", "AAYN", "AAYP", "AAYR", "AAYS", "AAYW", "AAYX", "AE0L", "AEJN", "AEJR", "AEL", "AELN", "AELS", "AEML", "AENN", "AER", "AERK", "AERL", "AERN", "AERP", "AERT", "AESP", "AESX", "BB", "BB0", "BB0B", "BB0F", "BB0K", "BB0L", "BB0M", "BB0N", "BB0P", "BB0R", "BB0S", "BB0T", "BB0W", "BB0X", "BBB", "BBBB", "BBBH", "BBBJ", "BBBK", "BBBL", "BBBM", "BBBN", "BBBR", "BBBS", "BBBT", "BBBW", "BBBX", "BBBY", "BBF", "BBFF", "BBFH", "BBFK", "BBFL", "BBFN", "BBFP", "BBFR", "BBFS", "BBFT", "BBFW", "BBFX", "BBH", "BBHF", "BBHK", "BBHL", "BBHM", "BBHN", "BBHR", "BBHS", "BBHT", "BBHW", "BBHX", "BBJ", "BBJB", "BBJJ", "BBJK", "BBJL", "BBJM", "BBJN", "BBJR", "BBJS", "BBJT", "BBJW", "BBK", "BBK0", "BBKB", "BBKF", "BBKH", "BBKJ", "BBKK", "BBKL", "BBKM", "BBKN", "BBKP", "BBKR", "BBKS", "BBKT", "BBKW", "BBKX", "BBKY", "BBL", "BBL0", "BBLB", "BBLF", "BBLH", "BBLJ", "BBLK", "BBLL", "BBLM", "BBLN", "BBLP", "BBLR", "BBLS", "BBLT", "BBLW", "BBLX", "BBLY", "BBM", "BBM0", "BBMB", "BBMF", "BBMJ", "BBMK", "BBML", "BBMM", "BBMN", "BBMP", "BBMR", "BBMS", "BBMT", "BBMW", "BBMX", "BBN", "BBN0", "BBNB", "BBNF", "BBNH", "BBNJ", "BBNK", "BBNL", "BBNM", "BBNN", "BBNP", "BBNR", "BBNS", "BBNT", "BBNW", "BBNX", "BBNY", "BBP", "BBPL", "BBPM", "BBPN", "BBPP", "BBPR", "BBPS", "BBPT", "BBPX", "BBR", "BBR0", "BBRB", "BBRF", "BBRH", "BBRJ", "BBRK", "BBRL", "BBRM", "BBRN", "BBRP", "BBRR", "BBRS", "BBRT", "BBRW", "BBRX", "BBRY", "BBS", "BBS0", "BBSB", "BBSF", "BBSH", "BBSJ", "BBSK", "BBSL", "BBSM", "BBSN", "BBSP", "BBSR", "BBSS", "BBST", "BBSW", "BBSX", "BBT", "BBT0", "BBTB", "BBTF", "BBTH", "BBTJ", "BBTK", "BBTL", "BBTM", "BBTN", "BBTP", "BBTR", "BBTS", "BBTT", "BBTW", "BBTX", "BBTY", "BBW", "BBWK", "BBWL", "BBWN", "BBWR", "BBWS", "BBWT", "BBWY", "BBX", "BBXB", "BBXF", "BBXH", "BBXK", "BBXL", "BBXM", "BBXN", "BBXP", "BBXR", "BBXS", "BBXT", "BBXW", "BBXX", "BBY", "BBY0", "BBYB", "BBYH", "BBYJ", "BBYK", "BBYL", "BBYM", "BBYN", "BBYP", "BBYR", "BBYS", "BBYT", "BBYW", "BBYY", "CK", "CK0", "CK0B", "CK0K", "CK0L", "CK0M", "CK0N", "CK0R", "CK0S", "CK0T", "CK0W", "CKB", "CKBB", "CKBF", "CKBH", "CKBJ", "CKBK", "CKBL", "CKBM", "CKBN", "CKBR", "CKBS", "CKBT", "CKBW", "CKBX", "CKBY", "CKF", "CKFB", "CKFF", "CKFH", "CKFK", "CKFL", "CKFN", "CKFP", "CKFR", "CKFS", "CKFT", "CKFX", "CKH", "CKHL", "CKHN", "CKHR", "CKHT", "CKJ", "CKJB", "CKJK", "CKJL", "CKJN", "CKJP", "CKJR", "CKJT", "CKJW", "CKK", "CKK0", "CKKB", "CKKF", "CKKH", "CKKJ", "CKKK", "CKKL", "CKKM", "CKKN", "CKKP", "CKKR", "CKKS", "CKKT", "CKKW", "CKKX", "CKKY", "CKL", "CKL0", "CKLB", "CKLF", "CKLH", "CKLJ", "CKLK", "CKLL", "CKLM", "CKLN", "CKLP", "CKLR", "CKLS", "CKLT", "CKLW", "CKLX", "CKLY", "CKM", "CKMB", "CKMF", "CKMJ", "CKMK", "CKML", "CKMM", "CKMN", "CKMP", "CKMR", "CKMS", "CKMT", "CKMW", "CKMY", "CKN", "CKN0", "CKNB", "CKNF", "CKNH", "CKNJ", "CKNK", "CKNL", "CKNM", "CKNN", "CKNP", "CKNR", "CKNS", "CKNT", "CKNW", "CKNX", "CKNY", "CKP", "CKP0", "CKPB", "CKPF", "CKPH", "CKPJ", "CKPK", "CKPL", "CKPM", "CKPN", "CKPP", "CKPR", "CKPS", "CKPT", "CKPW", "CKPX", "CKPY", "CKR", "CKR0", "CKRB", "CKRF", "CKRH", "CKRJ", "CKRK", "CKRL", "CKRM", "CKRN", "CKRP", "CKRR", "CKRS", "CKRT", "CKRW", "CKRX", "CKRY", "CKS", "CKSB", "CKSF", "CKSH", "CKSJ", "CKSK", "CKSL", "CKSM", "CKSN", "CKSP", "CKSR", "CKSS", "CKST", "CKSW", "CKSX", "CKT", "CKT0", "CKTB", "CKTF", "CKTH", "CKTJ", "CKTK", "CKTL", "CKTM", "CKTN", "CKTP", "CKTR", "CKTS", "CKTT", "CKTW", "CKTX", "CKTY", "CKW", "CKWB", "CKWL", "CKWM", "CKWN", "CKWP", "CKWR", "CKWS", "CKWT", "CKX", "CKXB", "CKXF", "CKXH", "CKXK", "CKXL", "CKXM", "CKXN", "CKXP", "CKXR", "CKXS", "CKXT", "CKXW", "CKY", "CKYB", "CKYK", "CKYL", "CKYM", "CKYN", "CKYP", "CKYR", "CKYT", "CKYY", "CS0N", "CSB", "CSBL", "CSBR", "CSBS", "CSF", "CSFK", "CSFL", "CSFN", "CSFR", "CSFS", "CSFT", "CSJ", "CSKK", "CSKL", "CSKN", "CSKS", "CSKT", "CSKW", "CSKX", "CSL", "CSLB", "CSLF", "CSLH", "CSLK", "CSLM", "CSLN", "CSLR", "CSLS", "CSLT", "CSLW", "CSLX", "CSM", "CSML", "CSMN", "CSMR", "CSMS", "CSMT", "CSN", "CSN0", "CSNB", "CSNK", "CSNL", "CSNM", "CSNR", "CSNS", "CSNT", "CSNX", "CSP", "CSPL", "CSPR", "CSR", "CSRB", "CSRF", "CSRK", "CSRL", "CSRM", "CSRN", "CSRS", "CSRT", "CSSF", "CSSK", "CSSL", "CSSN", "CSSR", "CSSS", "CSST", "CST", "CSTB", "CSTF", "CSTH", "CSTK", "CSTL", "CSTM", "CSTN", "CSTP", "CSTR", "CSTS", "CSTT", "CSTW", "CSTX", "CSXL", "CSXN", "CSY0", "CSYN", "CX", "CX0M", "CXB", "CXBH", "CXBK", "CXBL", "CXBN", "CXBR", "CXBT", "CXF", "CXFK", "CXFL", "CXFM", "CXFN", "CXFP", "CXFR", "CXFS", "CXFT", "CXHL", "CXJ", "CXJS", "CXK", "CXKB", "CXKK", "CXKL", "CXKM", "CXKN", "CXKP", "CXKR", "CXKS", "CXKT", "CXKW", "CXKX", "CXL", "CXLB", "CXLF", "CXLH", "CXLK", "CXLM", "CXLN", "CXLP", "CXLR", "CXLS", "CXLT", "CXLW", "CXLY", "CXM", "CXMK", "CXML", "CXMM", "CXMN", "CXMP", "CXMR", "CXMS", "CXN", "CXN0", "CXNB", "CXNF", "CXNH", "CXNJ", "CXNK", "CXNL", "CXNM", "CXNN", "CXNP", "CXNR", "CXNS", "CXNT", "CXNW", "CXNX", "CXP", "CXPH", "CXPL", "CXPM", "CXPN", "CXPR", "CXPS", "CXPT", "CXPW", "CXPX", "CXR", "CXR0", "CXRB", "CXRF", "CXRH", "CXRJ", "CXRK", "CXRL", "CXRM", "CXRN", "CXRP", "CXRR", "CXRS", "CXRT", "CXRW", "CXRX", "CXS", "CXSB", "CXSF", "CXSL", "CXSM", "CXSN", "CXSP", "CXSR", "CXSS", "CXST", "CXSW", "CXT", "CXTB", "CXTF", "CXTK", "CXTL", "CXTM", "CXTN", "CXTR", "CXTS", "CXTW", "CXTX", "CXWB", "CXWL", "CXWN", "CXWR", "CXX", "CXXL", "CXXM", "CXXN", "CXXR", "CXXS", "CXYN", "DT", "DT0", "DT0H", "DT0R", "DT0S", "DT0T", "DT0W", "DTB", "DTBB", "DTBF", "DTBH", "DTBJ", "DTBK", "DTBL", "DTBM", "DTBN", "DTBP", "DTBR", "DTBS", "DTBT", "DTBW", "DTBX", "DTBY", "DTF", "DTFB", "DTFF", "DTFH", "DTFJ", "DTFK", "DTFL", "DTFM", "DTFN", "DTFP", "DTFR", "DTFS", "DTFT", "DTFX", "DTH", "DTHF", "DTHJ", "DTHK", "DTHL", "DTHM", "DTHN", "DTHR", "DTHT", "DTHY", "DTJ", "DTJB", "DTJH", "DTJJ", "DTJK", "DTJL", "DTJM", "DTJN", "DTJP", "DTJR", "DTJS", "DTJT", "DTK", "DTK0", "DTKB", "DTKF", "DTKH", "DTKK", "DTKL", "DTKM", "DTKN", "DTKP", "DTKR", "DTKS", "DTKT", "DTKW", "DTKX", "DTKY", "DTL", "DTL0", "DTLB", "DTLF", "DTLH", "DTLJ", "DTLK", "DTLL", "DTLM", "DTLN", "DTLP", "DTLR", "DTLS", "DTLT", "DTLW", "DTLX", "DTLY", "DTM", "DTMB", "DTMF", "DTMJ", "DTMK", "DTML", "DTMM", "DTMN", "DTMP", "DTMR", "DTMS", "DTMT", "DTMX", "DTMY", "DTN", "DTN0", "DTNB", "DTNF", "DTNH", "DTNJ", "DTNK", "DTNL", "DTNM", "DTNN", "DTNP", "DTNR", "DTNS", "DTNT", "DTNW", "DTNX", "DTNY", "DTP", "DTPB", "DTPF", "DTPK", "DTPL", "DTPM", "DTPN", "DTPP", "DTPR", "DTPS", "DTPT", "DTPW", "DTPX", "DTR", "DTR0", "DTRB", "DTRF", "DTRH", "DTRJ", "DTRK", "DTRL", "DTRM", "DTRN", "DTRP", "DTRR", "DTRS", "DTRT", "DTRW", "DTRX", "DTRY", "DTS", "DTS0", "DTSB", "DTSF", "DTSH", "DTSK", "DTSL", "DTSM", "DTSN", "DTSP", "DTSR", "DTSS", "DTST", "DTSW", "DTSX", "DTSY", "DTT", "DTTB", "DTTF", "DTTH", "DTTK", "DTTL", "DTTM", "DTTN", "DTTP", "DTTR", "DTTS", "DTTT", "DTTW", "DTW", "DTWK", "DTWL", "DTWN", "DTWR", "DTWS", "DTWT", "DTWX", "DTX", "DTXF", "DTXL", "DTXM", "DTXN", "DTXP", "DTXR", "DTXS", "DTXT", "DTXW", "DTY", "DTYL", "DTYM", "DTYN", "DTYR", "DTYS", "DTYT", "EE", "EE0", "EE0L", "EE0M", "EE0N", "EE0R", "EE0S", "EEB", "EEBL", "EEBN", "EEBR", "EEBS", "EEBT", "EEF", "EEF0", "EEFB", "EEFF", "EEFK", "EEFL", "EEFM", "EEFN", "EEFR", "EEFS", "EEFT", "EEFW", "EEFX", "EEHL", "EEHW", "EEJ", "EEJB", "EEJF", "EEJH", "EEJK", "EEJL", "EEJM", "EEJN", "EEJP", "EEJR", "EEJS", "EEJT", "EEJW", "EEK", "EEKB", "EEKF", "EEKH", "EEKK", "EEKL", "EEKM", "EEKN", "EEKP", "EEKR", "EEKS", "EEKT", "EEKX", "EEL", "EEL0", "EELB", "EELF", "EELH", "EELJ", "EELK", "EELL", "EELM", "EELN", "EELP", "EELR", "EELS", "EELT", "EELW", "EELX", "EELY", "EEM", "EEMB", "EEMF", "EEMH", "EEMJ", "EEMK", "EEML", "EEMM", "EEMN", "EEMP", "EEMR", "EEMS", "EEMT", "EEMW", "EEN", "EENB", "EENF", "EENH", "EENJ", "EENK", "EENL", "EENM", "EENN", "EENR", "EENS", "EENT", "EENX", "EENY", "EEP", "EEPF", "EEPK", "EEPL", "EEPN", "EEPR", "EEPS", "EEPT", "EEPW", "EER", "EER0", "EERB", "EERF", "EERH", "EERJ", "EERK", "EERL", "EERM", "EERN", "EERP", "EERR", "EERS", "EERT", "EERW", "EERX", "EERY", "EES", "EES0", "EESB", "EESK", "EESL", "EESM", "EESN", "EESP", "EESR", "EESS", "EEST", "EESX", "EET", "EET0", "EETB", "EETF", "EETH", "EETJ", "EETK", "EETL", "EETM", "EETN", "EETP", "EETR", "EETS", "EETT", "EETW", "EETX", "EETY", "EEW", "EEWL", "EEWN", "EEWR", "EEWS", "EEWT", "EEX", "EEXB", "EEXF", "EEXH", "EEXK", "EEXL", "EEXM", "EEXN", "EEXP", "EEXR", "EEXT", "EEYB", "EEYN", "EEYR", "FF", "FF0", "FF0F", "FF0L", "FF0M", "FF0R", "FFB", "FFBJ", "FFBK", "FFBL", "FFBN", "FFBR", "FFBS", "FFF", "FFF0", "FFFB", "FFFF", "FFFK", "FFFL", "FFFM", "FFFN", "FFFP", "FFFR", "FFFS", "FFFT", "FFFW", "FFFX", "FFH", "FFHL", "FFHN", "FFHS", "FFHT", "FFJ", "FFJN", "FFJR", "FFK", "FFKB", "FFKF", "FFKH", "FFKK", "FFKL", "FFKM", "FFKN", "FFKR", "FFKS", "FFKT", "FFKW", "FFKX", "FFL", "FFL0", "FFLB", "FFLF", "FFLH", "FFLJ", "FFLK", "FFLL", "FFLM", "FFLN", "FFLP", "FFLR", "FFLS", "FFLT", "FFLW", "FFLX", "FFLY", "FFM", "FFMB", "FFMK", "FFML", "FFMN", "FFMP", "FFMR", "FFMS", "FFMT", "FFMX", "FFN", "FFN0", "FFNB", "FFNF", "FFNH", "FFNJ", "FFNK", "FFNL", "FFNM", "FFNN", "FFNP", "FFNR", "FFNS", "FFNT", "FFNW", "FFNX", "FFPL", "FFR", "FFR0", "FFRB", "FFRF", "FFRH", "FFRJ", "FFRK", "FFRL", "FFRM", "FFRN", "FFRP", "FFRR", "FFRS", "FFRT", "FFRW", "FFRX", "FFRY", "FFS", "FFSB", "FFSF", "FFSK", "FFSL", "FFSN", "FFSR", "FFSS", "FFST", "FFSX", "FFT", "FFTB", "FFTK", "FFTL", "FFTM", "FFTN", "FFTP", "FFTR", "FFTS", "FFTT", "FFTW", "FFTX", "FFW", "FFWL", "FFWN", "FFWS", "FFWT", "FFX", "FFXB", "FFXF", "FFXH", "FFXK", "FFXL", "FFXM", "FFXN", "FFXP", "FFXR", "FFXS", "FFXT", "FFXW", "FFXX", "FFY", "FFYB", "FFYL", "FFYN", "FFYS", "FFYT", "GFKR", "GFLF", "GFLK", "GFLN", "GFLS", "GFN", "GFNF", "GFNN", "GFNT", "GFR", "GFRK", "GFRL", "GFRN", "GFRS", "GFSL", "GFSP", "GFST", "GFTL", "GJ", "GJ0N", "GJB", "GJBH", "GJBK", "GJBL", "GJBM", "GJBN", "GJBR", "GJBS", "GJBT", "GJF", "GJFB", "GJFF", "GJFK", "GJFL", "GJFN", "GJFR", "GJFS", "GJFT", "GJFW", "GJFX", "GJH", "GJHK", "GJHM", "GJHT", "GJJ", "GJJL", "GJJN", "GJJR", "GJJS", "GJJT", "GJJY", "GJK", "GJKB", "GJKK", "GJKL", "GJKM", "GJKN", "GJKR", "GJKS", "GJL", "GJLB", "GJLF", "GJLH", "GJLJ", "GJLK", "GJLL", "GJLM", "GJLN", "GJLP", "GJLR", "GJLS", "GJLT", "GJLW", "GJLX", "GJM", "GJMB", "GJMF", "GJMH", "GJMK", "GJML", "GJMN", "GJMP", "GJMR", "GJMS", "GJMW", "GJN", "GJN0", "GJNB", "GJNF", "GJNJ", "GJNK", "GJNL", "GJNM", "GJNN", "GJNR", "GJNS", "GJNT", "GJNX", "GJP", "GJPN", "GJPR", "GJPS", "GJPT", "GJR", "GJR0", "GJRB", "GJRF", "GJRH", "GJRJ", "GJRK", "GJRL", "GJRM", "GJRN", "GJRR", "GJRS", "GJRT", "GJRW", "GJRX", "GJS", "GJSB", "GJSK", "GJSL", "GJSM", "GJSN", "GJSP", "GJSR", "GJST", "GJT", "GJTB", "GJTF", "GJTJ", "GJTL", "GJTN", "GJTP", "GJTR", "GJTS", "GJTT", "GJTW", "GJTX", "GJTY", "GJW", "GJWN", "GJX", "GJXL", "GJXM", "GJY", "GJYR", "GK", "GK0", "GK0K", "GK0L", "GK0M", "GK0N", "GK0R", "GK0S", "GK0W", "GKB", "GKBB", "GKBK", "GKBL", "GKBN", "GKBR", "GKBS", "GKBT", "GKBW", "GKBX", "GKBY", "GKF", "GKFJ", "GKFK", "GKFL", "GKFN", "GKFR", "GKFS", "GKFT", "GKHK", "GKHL", "GKHN", "GKHR", "GKJ", "GKJK", "GKJL", "GKJN", "GKJR", "GKJS", "GKJT", "GKK", "GKKK", "GKKL", "GKKM", "GKKN", "GKKP", "GKKR", "GKKS", "GKKT", "GKKX", "GKL", "GKL0", "GKLB", "GKLF", "GKLH", "GKLJ", "GKLK", "GKLL", "GKLM", "GKLN", "GKLP", "GKLR", "GKLS", "GKLT", "GKLW", "GKLX", "GKLY", "GKM", "GKMB", "GKMF", "GKMH", "GKMJ", "GKMK", "GKML", "GKMM", "GKMN", "GKMP", "GKMR", "GKMS", "GKMT", "GKMW", "GKMY", "GKN", "GKN0", "GKNB", "GKNF", "GKNH", "GKNJ", "GKNK", "GKNL", "GKNM", "GKNN", "GKNP", "GKNR", "GKNS", "GKNT", "GKNW", "GKNX", "GKNY", "GKP", "GKPB", "GKPF", "GKPH", "GKPK", "GKPL", "GKPP", "GKPR", "GKPS", "GKPW", "GKR", "GKR0", "GKRB", "GKRF", "GKRH", "GKRJ", "GKRK", "GKRL", "GKRM", "GKRN", "GKRP", "GKRR", "GKRS", "GKRT", "GKRW", "GKRX", "GKRY", "GKS", "GKS0", "GKSB", "GKSF", "GKSH", "GKSJ", "GKSK", "GKSL", "GKSM", "GKSN", "GKSP", "GKSR", "GKSS", "GKST", "GKSW", "GKSX", "GKT", "GKTB", "GKTF", "GKTH", "GKTJ", "GKTK", "GKTL", "GKTM", "GKTN", "GKTP", "GKTR", "GKTS", "GKTT", "GKTW", "GKTX", "GKTY", "GKW", "GKW0", "GKWB", "GKWL", "GKWM", "GKWN", "GKWR", "GKWT", "GKX", "GKXK", "GKXM", "GKXN", "GKXR", "GKXS", "GKY", "GKYK", "GKYM", "GKYN", "GKYR", "GKYT", "GNBR", "GNL", "GNLS", "GNLY", "GNNK", "GNNT", "GNR", "GNRB", "GNRK", "GNRL", "GNRM", "GNRN", "GNRP", "GNRW", "GNSH", "GNT", "GNTK", "GNTN", "GNWL", "GNWN", "H0", "H0RT", "HBL", "HBLS", "HBN", "HBN0", "HBNS", "HBRM", "HBRT", "HBST", "HFJL", "HFLT", "HFR", "HFRS", "HH", "HH0", "HH0B", "HH0F", "HH0H", "HH0K", "HH0L", "HH0M", "HH0N", "HH0P", "HH0R", "HH0S", "HH0T", "HH0W", "HHB", "HHBB", "HHBH", "HHBK", "HHBL", "HHBN", "HHBR", "HHBS", "HHBT", "HHBW", "HHBX", "HHBY", "HHF", "HHFB", "HHFF", "HHFH", "HHFJ", "HHFK", "HHFL", "HHFM", "HHFN", "HHFP", "HHFR", "HHFS", "HHFT", "HHFW", "HHFX", "HHH", "HHHN", "HHHR", "HHHS", "HHJ", "HHJF", "HHJL", "HHJM", "HHJN", "HHJR", "HHJS", "HHJT", "HHJW", "HHJY", "HHK", "HHKB", "HHKF", "HHKH", "HHKK", "HHKL", "HHKM", "HHKN", "HHKP", "HHKR", "HHKS", "HHKT", "HHKW", "HHKX", "HHL", "HHL0", "HHLB", "HHLF", "HHLH", "HHLJ", "HHLK", "HHLL", "HHLM", "HHLN", "HHLP", "HHLR", "HHLS", "HHLT", "HHLW", "HHLX", "HHLY", "HHM", "HHMB", "HHMF", "HHMH", "HHMJ", "HHMK", "HHML", "HHMM", "HHMN", "HHMP", "HHMR", "HHMS", "HHMT", "HHMW", "HHMX", "HHMY", "HHN", "HHN0", "HHNB", "HHNF", "HHNH", "HHNJ", "HHNK", "HHNL", "HHNM", "HHNN", "HHNP", "HHNR", "HHNS", "HHNT", "HHNW", "HHNX", "HHNY", "HHP", "HHP0", "HHPB", "HHPF", "HHPH", "HHPJ", "HHPK", "HHPL", "HHPM", "HHPN", "HHPP", "HHPR", "HHPS", "HHPT", "HHPW", "HHR", "HHR0", "HHRB", "HHRF", "HHRH", "HHRJ", "HHRK", "HHRL", "HHRM", "HHRN", "HHRP", "HHRR", "HHRS", "HHRT", "HHRW", "HHRX", "HHRY", "HHS", "HHS0", "HHSB", "HHSF", "HHSH", "HHSK", "HHSL", "HHSM", "HHSN", "HHSP", "HHSR", "HHSS", "HHST", "HHSW", "HHSX", "HHT", "HHTB", "HHTF", "HHTH", "HHTK", "HHTL", "HHTM", "HHTN", "HHTP", "HHTR", "HHTS", "HHTT", "HHTW", "HHTX", "HHTY", "HHW", "HHW0", "HHWK", "HHWL", "HHWN", "HHWR", "HHWS", "HHWT", "HHWX", "HHX", "HHXB", "HHXF", "HHXK", "HHXL", "HHXM", "HHXN", "HHXP", "HHXR", "HHXS", "HHXT", "HHXW", "HHY", "HHYK", "HHYN", "HHYR", "HHYS", "HJ", "HJR0", "HJRT", "HJT", "HKRF", "HLKL", "HLNT", "HLS", "HLTN", "HLTS", "HM0", "HMBS", "HMKS", "HMLR", "HMN", "HMNS", "HMS", "HMSB", "HMSS", "HMTS", "HMXL", "HN", "HNM", "HNMK", "HNS", "HNST", "HNTF", "HNTM", "HNTS", "HNX", "HPRN", "HPX", "HR", "HRBL", "HRM", "HRT", "HSKR", "HSLP", "HSM0", "HSN", "HSP", "HSTN", "HT", "HTBR", "HTFL", "HTHL", "HTHR", "HTKR", "HTN", "HTNL", "HTNM", "HTNN", "HTNS", "HTPR", "HTR", "HTRB", "HTRF", "HTRJ", "HTRL", "HTRN", "HTRS", "HTS", "HTSK", "HTSP", "HTTL", "HTTS", "HTWB", "HWLR", "HWLT", "HX", "HXRK", "HXRS", "HYLN", "HYM", "HYMS", "HYNT", "HYRN", "HYSN", "HYT", "HYTS", "II", "II0K", "II0M", "IIBB", "IIBK", "IIBL", "IIBR", "IIBS", "IIBT", "IIBY", "IIF", "IIF0", "IIFB", "IIFF", "IIFH", "IIFK", "IIFL", "IIFM", "IIFN", "IIFR", "IIFS", "IIFT", "IIHF", "IIJB", "IIJN", "IIJR", "IIJS", "IIK", "IIKK", "IIKL", "IIKN", "IIKR", "IIKS", "IIKT", "IIKW", "IIL", "IILB", "IILF", "IILH", "IILJ", "IILK", "IILL", "IILM", "IILN", "IILP", "IILR", "IILS", "IILT", "IILW", "IILX", "IILY", "IIM", "IIMF", "IIMH", "IIMJ", "IIMK", "IIML", "IIMN", "IIMP", "IIMR", "IIMS", "IIMT", "IIMY", "IIN", "IIN0", "IINB", "IINF", "IINH", "IINJ", "IINK", "IINL", "IINM", "IINN", "IINP", "IINR", "IINS", "IINT", "IINW", "IINX", "IINY", "IIP", "IIPL", "IIPM", "IIPN", "IIPR", "IIPS", "IIPT", "IIR", "IIRB", "IIRF", "IIRJ", "IIRK", "IIRL", "IIRM", "IIRN", "IIRP", "IIRR", "IIRS", "IIRT", "IIRW", "IIRX", "IIS", "IISB", "IISF", "IISK", "IISL", "IISM", "IISN", "IISP", "IISR", "IISS", "IIST", "IISW", "IISX", "IIT", "IITB", "IITF", "IITH", "IITJ", "IITK", "IITL", "IITM", "IITN", "IITR", "IITS", "IITT", "IITW", "IIW", "IIWN", "IIWR", "IIWS", "IIWT", "IIX", "IIXB", "IIXL", "IIXM", "IIXN", "IIXR", "IIXT", "IIYP", "JJ", "JJ0", "JJ0R", "JJ0W", "JJB", "JJBF", "JJBJ", "JJBK", "JJBL", "JJBN", "JJBR", "JJBS", "JJBT", "JJBW", "JJF", "JJFH", "JJFJ", "JJFK", "JJFL", "JJFN", "JJFR", "JJFS", "JJFX", "JJH", "JJHK", "JJHL", "JJHN", "JJHP", "JJHR", "JJHS", "JJJ", "JJJH", "JJJL", "JJJN", "JJJR", "JJJS", "JJJT", "JJK", "JJK0", "JJKB", "JJKF", "JJKH", "JJKJ", "JJKK", "JJKL", "JJKM", "JJKN", "JJKP", "JJKR", "JJKS", "JJKT", "JJKW", "JJL", "JJLB", "JJLF", "JJLJ", "JJLK", "JJLL", "JJLM", "JJLN", "JJLP", "JJLR", "JJLS", "JJLT", "JJLW", "JJLY", "JJM", "JJMB", "JJMF", "JJMH", "JJMJ", "JJMK", "JJML", "JJMM", "JJMN", "JJMP", "JJMR", "JJMS", "JJMT", "JJMW", "JJMX", "JJN", "JJN0", "JJNB", "JJNF", "JJNH", "JJNJ", "JJNK", "JJNL", "JJNM", "JJNN", "JJNP", "JJNR", "JJNS", "JJNT", "JJNW", "JJNX", "JJNY", "JJP", "JJPJ", "JJPK", "JJPL", "JJPN", "JJPR", "JJPS", "JJPT", "JJPX", "JJR", "JJRB", "JJRF", "JJRJ", "JJRK", "JJRL", "JJRM", "JJRN", "JJRP", "JJRR", "JJRS", "JJRT", "JJRW", "JJRX", "JJS", "JJSB", "JJSF", "JJSH", "JJSJ", "JJSK", "JJSL", "JJSM", "JJSN", "JJSP", "JJSR", "JJSS", "JJST", "JJSW", "JJSX", "JJT", "JJT0", "JJTB", "JJTF", "JJTJ", "JJTK", "JJTL", "JJTM", "JJTN", "JJTP", "JJTR", "JJTS", "JJTT", "JJTX", "JJW", "JJWK", "JJWL", "JJWN", "JJWR", "JJWS", "JJWT", "JJX", "JJXK", "JJXM", "JJXN", "JJXR", "JJXS", "JJY", "JJYF", "JJYL", "JJYN", "JJYR", "JJYS", "KK", "KK0", "KK0B", "KK0F", "KK0H", "KK0J", "KK0K", "KK0L", "KK0M", "KK0N", "KK0P", "KK0R", "KK0S", "KK0T", "KK0W", "KK0X", "KKB", "KKBB", "KKBJ", "KKBK", "KKBL", "KKBN", "KKBR", "KKBS", "KKBT", "KKBX", "KKBY", "KKF", "KKFB", "KKFK", "KKFL", "KKFM", "KKFN", "KKFP", "KKFR", "KKFS", "KKFT", "KKH", "KKHB", "KKHL", "KKHM", "KKHN", "KKHP", "KKHR", "KKHS", "KKHT", "KKHY", "KKJ", "KKJB", "KKJK", "KKJL", "KKJN", "KKJR", "KKJS", "KKJT", "KKJY", "KKK", "KKK0", "KKKB", "KKKK", "KKKL", "KKKM", "KKKN", "KKKP", "KKKR", "KKKS", "KKKT", "KKKW", "KKKY", "KKL", "KKL0", "KKLB", "KKLF", "KKLH", "KKLJ", "KKLK", "KKLL", "KKLM", "KKLN", "KKLP", "KKLR", "KKLS", "KKLT", "KKLW", "KKLX", "KKLY", "KKM", "KKM0", "KKMB", "KKMF", "KKMH", "KKMJ", "KKMK", "KKML", "KKMM", "KKMN", "KKMP", "KKMR", "KKMS", "KKMT", "KKMX", "KKN", "KKN0", "KKNB", "KKNF", "KKNH", "KKNJ", "KKNK", "KKNL", "KKNM", "KKNN", "KKNP", "KKNR", "KKNS", "KKNT", "KKNW", "KKNX", "KKNY", "KKP", "KKPB", "KKPF", "KKPH", "KKPK", "KKPL", "KKPM", "KKPN", "KKPR", "KKPS", "KKPT", "KKPW", "KKPX", "KKPY", "KKR", "KKR0", "KKRB", "KKRF", "KKRH", "KKRJ", "KKRK", "KKRL", "KKRM", "KKRN", "KKRP", "KKRR", "KKRS", "KKRT", "KKRW", "KKRX", "KKRY", "KKS", "KKS0", "KKSB", "KKSF", "KKSK", "KKSL", "KKSM", "KKSN", "KKSP", "KKSR", "KKSS", "KKST", "KKSW", "KKSX", "KKSY", "KKT", "KKTB", "KKTF", "KKTH", "KKTJ", "KKTK", "KKTL", "KKTM", "KKTN", "KKTP", "KKTR", "KKTS", "KKTT", "KKTW", "KKTX", "KKTY", "KKW", "KKWB", "KKWF", "KKWH", "KKWK", "KKWL", "KKWN", "KKWR", "KKWS", "KKWT", "KKWW", "KKWX", "KKX", "KKXF", "KKXJ", "KKXK", "KKXL", "KKXM", "KKXN", "KKXR", "KKXS", "KKY", "KKYB", "KKYK", "KKYL", "KKYM", "KKYN", "KKYP", "KKYR", "KKYS", "KKYT", "KKYW", "KN", "KN0", "KNB", "KNBK", "KNBL", "KNBN", "KNBS", "KNBW", "KNF", "KNFL", "KNFT", "KNK", "KNKB", "KNKF", "KNKL", "KNKP", "KNKR", "KNKS", "KNKT", "KNL", "KNLB", "KNLJ", "KNLM", "KNLN", "KNLR", "KNLS", "KNLT", "KNLW", "KNN", "KNNJ", "KNNK", "KNP", "KNPH", "KNPK", "KNPM", "KNPS", "KNPT", "KNPW", "KNR", "KNRH", "KNS", "KNSL", "KNST", "KNT", "KNTL", "KNTN", "KNTR", "KNTS", "KNTW", "KNW", "KNWN", "KNX", "KNYR", "LL", "LL0", "LL0B", "LL0F", "LL0J", "LL0K", "LL0L", "LL0M", "LL0N", "LL0P", "LL0R", "LL0S", "LL0T", "LL0W", "LLB", "LLB0", "LLBB", "LLBH", "LLBJ", "LLBK", "LLBL", "LLBM", "LLBN", "LLBR", "LLBS", "LLBT", "LLBW", "LLBX", "LLBY", "LLF", "LLF0", "LLFB", "LLFF", "LLFH", "LLFJ", "LLFK", "LLFL", "LLFM", "LLFN", "LLFP", "LLFR", "LLFS", "LLFT", "LLFW", "LLFX", "LLFY", "LLH", "LLHF", "LLHL", "LLHM", "LLHN", "LLHR", "LLHS", "LLHT", "LLJ", "LLJB", "LLJF", "LLJK", "LLJL", "LLJM", "LLJN", "LLJP", "LLJR", "LLJS", "LLJT", "LLJW", "LLJY", "LLK", "LLKB", "LLKF", "LLKH", "LLKJ", "LLKK", "LLKL", "LLKM", "LLKN", "LLKP", "LLKR", "LLKS", "LLKT", "LLKW", "LLKX", "LLKY", "LLL", "LLL0", "LLLB", "LLLF", "LLLH", "LLLJ", "LLLK", "LLLL", "LLLM", "LLLN", "LLLP", "LLLR", "LLLS", "LLLT", "LLLW", "LLLX", "LLLY", "LLM", "LLM0", "LLMB", "LLMF", "LLMH", "LLMJ", "LLMK", "LLML", "LLMM", "LLMN", "LLMP", "LLMR", "LLMS", "LLMT", "LLMW", "LLMX", "LLMY", "LLN", "LLN0", "LLNB", "LLNF", "LLNH", "LLNJ", "LLNK", "LLNL", "LLNM", "LLNN", "LLNP", "LLNR", "LLNS", "LLNT", "LLNW", "LLNX", "LLNY", "LLP", "LLP0", "LLPF", "LLPJ", "LLPK", "LLPL", "LLPM", "LLPN", "LLPR", "LLPS", "LLPT", "LLPW", "LLPX", "LLR", "LLR0", "LLRB", "LLRF", "LLRH", "LLRJ", "LLRK", "LLRL", "LLRM", "LLRN", "LLRP", "LLRR", "LLRS", "LLRT", "LLRW", "LLRX", "LLS", "LLSB", "LLSF", "LLSH", "LLSJ", "LLSK", "LLSL", "LLSM", "LLSN", "LLSP", "LLSR", "LLSS", "LLST", "LLSW", "LLSX", "LLSY", "LLT", "LLTB", "LLTF", "LLTH", "LLTJ", "LLTK", "LLTL", "LLTM", "LLTN", "LLTP", "LLTR", "LLTS", "LLTT", "LLTW", "LLTX", "LLTY", "LLW", "LLWK", "LLWL", "LLWN", "LLWR", "LLWS", "LLWT", "LLWX", "LLX", "LLXB", "LLXF", "LLXK", "LLXL", "LLXM", "LLXN", "LLXP", "LLXR", "LLXS", "LLXT", "LLXW", "LLY", "LLYK", "LLYL", "LLYM", "LLYN", "LLYR", "LLYT", "MM", "MM0", "MM0F", "MM0H", "MM0K", "MM0L", "MM0M", "MM0N", "MM0R", "MM0S", "MM0T", "MM0W", "MMB", "MMBH", "MMBJ", "MMBK", "MMBL", "MMBN", "MMBR", "MMBS", "MMBT", "MMBX", "MMF", "MMFH", "MMFJ", "MMFK", "MMFL", "MMFM", "MMFN", "MMFR", "MMFS", "MMFT", "MMH", "MMHB", "MMHF", "MMHH", "MMHK", "MMHL", "MMHM", "MMHN", "MMHR", "MMHS", "MMHT", "MMJ", "MMJB", "MMJF", "MMJK", "MMJL", "MMJM", "MMJN", "MMJP", "MMJR", "MMJS", "MMJT", "MMJW", "MMJY", "MMK", "MMK0", "MMKB", "MMKF", "MMKH", "MMKJ", "MMKK", "MMKL", "MMKM", "MMKN", "MMKP", "MMKR", "MMKS", "MMKT", "MMKW", "MMKX", "MMKY", "MML", "MML0", "MMLB", "MMLF", "MMLH", "MMLJ", "MMLK", "MMLL", "MMLM", "MMLN", "MMLP", "MMLR", "MMLS", "MMLT", "MMLW", "MMLX", "MMLY", "MMM", "MMM0", "MMMB", "MMMF", "MMMH", "MMMK", "MMML", "MMMM", "MMMN", "MMMP", "MMMR", "MMMS", "MMMT", "MMMW", "MMMX", "MMN", "MMN0", "MMNB", "MMNF", "MMNH", "MMNJ", "MMNK", "MMNL", "MMNM", "MMNN", "MMNP", "MMNR", "MMNS", "MMNT", "MMNW", "MMNX", "MMNY", "MMP", "MMPK", "MMPL", "MMPN", "MMPR", "MMPS", "MMPT", "MMPW", "MMPY", "MMR", "MMR0", "MMRB", "MMRF", "MMRH", "MMRJ", "MMRK", "MMRL", "MMRM", "MMRN", "MMRP", "MMRR", "MMRS", "MMRT", "MMRW", "MMRX", "MMRY", "MMS", "MMS0", "MMSB", "MMSF", "MMSH", "MMSJ", "MMSK", "MMSL", "MMSM", "MMSN", "MMSP", "MMSR", "MMSS", "MMST", "MMSW", "MMSX", "MMSY", "MMT", "MMTB", "MMTF", "MMTH", "MMTJ", "MMTK", "MMTL", "MMTM", "MMTN", "MMTP", "MMTR", "MMTS", "MMTT", "MMTW", "MMTX", "MMTY", "MMW", "MMWB", "MMWK", "MMWL", "MMWM", "MMWN", "MMWR", "MMWS", "MMWT", "MMX", "MMXB", "MMXF", "MMXK", "MMXL", "MMXM", "MMXN", "MMXP", "MMXR", "MMXS", "MMXT", "MMXW", "MMXX", "MMY", "MMYB", "MMYK", "MMYL", "MMYM", "MMYN", "MMYP", "MMYR", "MMYS", "MMYT", "NN", "NN0", "NN0B", "NN0F", "NN0L", "NN0M", "NN0N", "NN0R", "NN0S", "NN0T", "NN0X", "NNB", "NNB0", "NNBH", "NNBJ", "NNBK", "NNBL", "NNBN", "NNBP", "NNBR", "NNBS", "NNBT", "NNBW", "NNBX", "NNF", "NNF0", "NNFB", "NNFH", "NNFJ", "NNFK", "NNFL", "NNFN", "NNFR", "NNFS", "NNFT", "NNFX", "NNH0", "NNHF", "NNHK", "NNHL", "NNHM", "NNHN", "NNHR", "NNJ", "NNJB", "NNJL", "NNJM", "NNJN", "NNJR", "NNJY", "NNK", "NNKB", "NNKJ", "NNKK", "NNKL", "NNKM", "NNKN", "NNKP", "NNKR", "NNKS", "NNKT", "NNKW", "NNKX", "NNKY", "NNL", "NNL0", "NNLB", "NNLF", "NNLH", "NNLJ", "NNLK", "NNLL", "NNLM", "NNLN", "NNLP", "NNLR", "NNLS", "NNLT", "NNLW", "NNLX", "NNLY", "NNM", "NNM0", "NNMF", "NNMJ", "NNMK", "NNML", "NNMN", "NNMP", "NNMR", "NNMS", "NNMT", "NNMW", "NNMX", "NNMY", "NNN", "NNN0", "NNNB", "NNNF", "NNNH", "NNNJ", "NNNK", "NNNL", "NNNM", "NNNN", "NNNP", "NNNR", "NNNS", "NNNT", "NNNW", "NNNX", "NNNY", "NNP", "NNP0", "NNPK", "NNPL", "NNPN", "NNPR", "NNPT", "NNR", "NNR0", "NNRB", "NNRF", "NNRH", "NNRJ", "NNRK", "NNRL", "NNRM", "NNRN", "NNRP", "NNRR", "NNRS", "NNRT", "NNRW", "NNRX", "NNRY", "NNS", "NNS0", "NNSB", "NNSF", "NNSK", "NNSL", "NNSM", "NNSN", "NNSP", "NNSR", "NNSS", "NNST", "NNSW", "NNSX", "NNT", "NNT0", "NNTB", "NNTF", "NNTH", "NNTJ", "NNTK", "NNTL", "NNTM", "NNTN", "NNTP", "NNTR", "NNTS", "NNTT", "NNTW", "NNTX", "NNTY", "NNW", "NNWK", "NNWL", "NNWN", "NNWR", "NNWS", "NNWT", "NNX", "NNXB", "NNXF", "NNXJ", "NNXK", "NNXL", "NNXM", "NNXN", "NNXP", "NNXR", "NNXS", "NNXT", "NNXW", "NNY", "NNYB", "NNYK", "NNYL", "NNYM", "NNYN", "NNYP", "NNYR", "NNYS", "NNYT", "NNYW", "NNYY", "OO", "OO0", "OO0K", "OO0L", "OO0N", "OO0W", "OOB", "OOBB", "OOBF", "OOBK", "OOBL", "OOBM", "OOBN", "OOBR", "OOBS", "OOBT", "OOF", "OOF0", "OOFB", "OOFF", "OOFH", "OOFK", "OOFL", "OOFM", "OOFN", "OOFP", "OOFR", "OOFS", "OOFT", "OOFW", "OOFX", "OOH", "OOHH", "OOHK", "OOHL", "OOHN", "OOHR", "OOJL", "OOJM", "OOJR", "OOK", "OOKB", "OOKF", "OOKH", "OOKJ", "OOKK", "OOKL", "OOKM", "OOKN", "OOKP", "OOKR", "OOKS", "OOKT", "OOKW", "OOKX", "OOL", "OOLB", "OOLF", "OOLK", "OOLL", "OOLM", "OOLN", "OOLP", "OOLR", "OOLS", "OOLT", "OOLW", "OOLY", "OOM", "OOMB", "OOMF", "OOMH", "OOMK", "OOML", "OOMM", "OOMN", "OOMR", "OOMT", "OOMX", "OON", "OON0", "OONF", "OONJ", "OONK", "OONL", "OONM", "OONN", "OONP", "OONR", "OONS", "OONT", "OONW", "OONX", "OONY", "OOP", "OOPK", "OOPL", "OOPN", "OOPR", "OOPS", "OOPT", "OOPW", "OOR", "OOR0", "OORB", "OORF", "OORJ", "OORK", "OORL", "OORM", "OORN", "OORP", "OORR", "OORS", "OORT", "OORW", "OORX", "OORY", "OOS", "OOSB", "OOSJ", "OOSK", "OOSL", "OOSM", "OOSN", "OOSP", "OOSR", "OOSS", "OOST", "OOSW", "OOSX", "OOT", "OOTB", "OOTF", "OOTH", "OOTK", "OOTL", "OOTM", "OOTN", "OOTP", "OOTR", "OOTS", "OOTT", "OOTW", "OOTY", "OOWN", "OOWR", "OOX", "OOXL", "OOXN", "OOXR", "OOXS", "OOXT", "OOYM", "OOYN", "PF", "PFB", "PFBS", "PFF", "PFFL", "PFKN", "PFL", "PFLB", "PFLH", "PFLK", "PFLM", "PFLN", "PFLP", "PFLR", "PFLS", "PFLT", "PFLW", "PFM", "PFN", "PFNK", "PFNS", "PFNT", "PFP", "PFPR", "PFPS", "PFR", "PFRL", "PFRS", "PFRW", "PFS", "PFSF", "PFSK", "PFSM", "PFSN", "PFTK", "PFTN", "PFTS", "PNMN", "PP", "PP0", "PP0B", "PP0F", "PP0J", "PP0K", "PP0M", "PP0N", "PP0R", "PP0S", "PPB", "PPBJ", "PPBK", "PPBL", "PPBM", "PPBN", "PPBR", "PPBS", "PPBT", "PPBW", "PPF", "PPFF", "PPFK", "PPFL", "PPFM", "PPFN", "PPFR", "PPFS", "PPFT", "PPH", "PPHL", "PPHN", "PPHS", "PPHT", "PPJ", "PPJB", "PPJK", "PPJL", "PPJM", "PPJN", "PPJR", "PPJS", "PPJT", "PPJW", "PPK", "PPK0", "PPKB", "PPKF", "PPKH", "PPKK", "PPKL", "PPKM", "PPKN", "PPKP", "PPKR", "PPKS", "PPKT", "PPKW", "PPKX", "PPL", "PPL0", "PPLB", "PPLF", "PPLH", "PPLJ", "PPLK", "PPLL", "PPLM", "PPLN", "PPLP", "PPLR", "PPLS", "PPLT", "PPLW", "PPLX", "PPLY", "PPM", "PPMF", "PPMJ", "PPMK", "PPML", "PPMM", "PPMN", "PPMP", "PPMR", "PPMS", "PPMT", "PPMW", "PPMX", "PPN", "PPN0", "PPNB", "PPNF", "PPNH", "PPNJ", "PPNK", "PPNL", "PPNM", "PPNN", "PPNP", "PPNR", "PPNS", "PPNT", "PPNW", "PPNX", "PPNY", "PPP", "PPP0", "PPPB", "PPPF", "PPPH", "PPPJ", "PPPK", "PPPL", "PPPN", "PPPP", "PPPR", "PPPS", "PPPT", "PPPW", "PPPY", "PPR", "PPR0", "PPRB", "PPRF", "PPRH", "PPRJ", "PPRK", "PPRL", "PPRM", "PPRN", "PPRP", "PPRR", "PPRS", "PPRT", "PPRW", "PPRX", "PPRY", "PPS", "PPS0", "PPSB", "PPSF", "PPSH", "PPSJ", "PPSK", "PPSL", "PPSM", "PPSN", "PPSP", "PPSR", "PPSS", "PPST", "PPSW", "PPSX", "PPT", "PPT0", "PPTB", "PPTF", "PPTH", "PPTJ", "PPTK", "PPTL", "PPTM", "PPTN", "PPTP", "PPTR", "PPTS", "PPTT", "PPTW", "PPTX", "PPTY", "PPW", "PPWL", "PPWN", "PPWR", "PPWS", "PPWT", "PPX", "PPXB", "PPXF", "PPXK", "PPXL", "PPXM", "PPXN", "PPXP", "PPXR", "PPXS", "PPXT", "PPXW", "PPY", "PPYL", "PPYN", "PPYP", "PPYR", "PPYS", "PPYT", "PPYW", "QK", "QKB0", "QKBK", "QKBN", "QKBR", "QKBS", "QKBT", "QKF", "QKFN", "QKFP", "QKFR", "QKFS", "QKFT", "QKH", "QKK", "QKKB", "QKKL", "QKKM", "QKKN", "QKKR", "QKKS", "QKL", "QKLB", "QKLJ", "QKLK", "QKLM", "QKLN", "QKLP", "QKLR", "QKLS", "QKLT", "QKLX", "QKM", "QKMB", "QKMK", "QKMN", "QKMS", "QKMT", "QKN", "QKNB", "QKNF", "QKNH", "QKNJ", "QKNK", "QKNL", "QKNM", "QKNN", "QKNS", "QKNT", "QKNW", "QKNX", "QKPL", "QKPR", "QKR", "QKRB", "QKRF", "QKRH", "QKRK", "QKRL", "QKRM", "QKRN", "QKRP", "QKRR", "QKRS", "QKRT", "QKS", "QKS0", "QKSN", "QKSR", "QKST", "QKT", "QKTF", "QKTJ", "QKTK", "QKTL", "QKTN", "QKTR", "QKTS", "QKTT", "QKX", "QKYR", "RR", "RR0", "RR0B", "RR0F", "RR0H", "RR0J", "RR0K", "RR0L", "RR0M", "RR0N", "RR0R", "RR0S", "RR0T", "RR0W", "RRB", "RRB0", "RRBB", "RRBF", "RRBH", "RRBJ", "RRBK", "RRBL", "RRBM", "RRBN", "RRBR", "RRBS", "RRBT", "RRBW", "RRBX", "RRBY", "RRF", "RRFB", "RRFF", "RRFH", "RRFJ", "RRFK", "RRFL", "RRFM", "RRFN", "RRFP", "RRFR", "RRFS", "RRFT", "RRFW", "RRFX", "RRH", "RRHB", "RRHF", "RRHK", "RRHL", "RRHM", "RRHN", "RRHP", "RRHR", "RRHS", "RRHT", "RRJ", "RRJF", "RRJH", "RRJK", "RRJL", "RRJM", "RRJN", "RRJP", "RRJR", "RRJS", "RRJT", "RRJW", "RRJY", "RRK", "RRKB", "RRKF", "RRKH", "RRKJ", "RRKK", "RRKL", "RRKM", "RRKN", "RRKP", "RRKR", "RRKS", "RRKT", "RRKW", "RRKX", "RRL", "RRLB", "RRLF", "RRLJ", "RRLK", "RRLM", "RRLN", "RRLP", "RRLR", "RRLS", "RRLT", "RRLW", "RRLX", "RRLY", "RRM", "RRMB", "RRMF", "RRMH", "RRMJ", "RRMK", "RRML", "RRMM", "RRMN", "RRMP", "RRMR", "RRMS", "RRMT", "RRMW", "RRMX", "RRMY", "RRN", "RRN0", "RRNB", "RRNF", "RRNH", "RRNJ", "RRNK", "RRNL", "RRNM", "RRNN", "RRNP", "RRNR", "RRNS", "RRNT", "RRNW", "RRNX", "RRNY", "RRP", "RRPB", "RRPF", "RRPH", "RRPK", "RRPL", "RRPN", "RRPR", "RRPS", "RRPT", "RRPX", "RRPY", "RRR", "RRRH", "RRRK", "RRRL", "RRRM", "RRRN", "RRRP", "RRRS", "RRRT", "RRRW", "RRS", "RRS0", "RRSB", "RRSF", "RRSH", "RRSJ", "RRSK", "RRSL", "RRSM", "RRSN", "RRSP", "RRSR", "RRSS", "RRST", "RRSW", "RRSX", "RRT", "RRT0", "RRTB", "RRTF", "RRTH", "RRTJ", "RRTK", "RRTL", "RRTM", "RRTN", "RRTP", "RRTR", "RRTS", "RRTT", "RRTW", "RRTX", "RRTY", "RRW", "RRWL", "RRWN", "RRWR", "RRWS", "RRWT", "RRX", "RRXB", "RRXF", "RRXK", "RRXL", "RRXM", "RRXN", "RRXR", "RRXS", "RRXT", "RRXW", "RRY", "RRYB", "RRYF", "RRYK", "RRYL", "RRYN", "RRYP", "RRYR", "RRYS", "RRYT", "SS", "SS0", "SS0B", "SS0F", "SS0H", "SS0J", "SS0K", "SS0L", "SS0M", "SS0N", "SS0P", "SS0R", "SS0S", "SS0T", "SS0W", "SS0X", "SS0Y", "SSB", "SSB0", "SSBK", "SSBL", "SSBM", "SSBN", "SSBR", "SSBS", "SSBT", "SSBW", "SSBX", "SSF", "SSFJ", "SSFK", "SSFL", "SSFM", "SSFN", "SSFP", "SSFR", "SSFS", "SSFT", "SSFY", "SSH", "SSH0", "SSHF", "SSHJ", "SSHK", "SSHL", "SSHM", "SSHN", "SSHR", "SSHS", "SSJ", "SSJB", "SSJF", "SSJH", "SSJJ", "SSJL", "SSJM", "SSJN", "SSJR", "SSJS", "SSJT", "SSJW", "SSK", "SSK0", "SSKB", "SSKF", "SSKH", "SSKK", "SSKL", "SSKM", "SSKN", "SSKP", "SSKR", "SSKS", "SSKT", "SSKW", "SSKX", "SSKY", "SSL", "SSL0", "SSLB", "SSLF", "SSLH", "SSLJ", "SSLK", "SSLL", "SSLM", "SSLN", "SSLP", "SSLR", "SSLS", "SSLT", "SSLW", "SSLX", "SSLY", "SSM", "SSM0", "SSMB", "SSMF", "SSMH", "SSMJ", "SSMK", "SSML", "SSMM", "SSMN", "SSMP", "SSMR", "SSMS", "SSMT", "SSMW", "SSMX", "SSMY", "SSN", "SSN0", "SSNB", "SSNF", "SSNH", "SSNJ", "SSNK", "SSNL", "SSNM", "SSNN", "SSNP", "SSNR", "SSNS", "SSNT", "SSNW", "SSNX", "SSNY", "SSP", "SSP0", "SSPB", "SSPF", "SSPJ", "SSPK", "SSPL", "SSPM", "SSPN", "SSPR", "SSPS", "SSPT", "SSPW", "SSPX", "SSR", "SSR0", "SSRB", "SSRF", "SSRH", "SSRJ", "SSRK", "SSRL", "SSRM", "SSRN", "SSRP", "SSRR", "SSRS", "SSRT", "SSRW", "SSRX", "SSRY", "SSS", "SSSB", "SSSF", "SSSJ", "SSSK", "SSSL", "SSSM", "SSSN", "SSSP", "SSSR", "SSSS", "SSST", "SSSW", "SSSX", "SSSY", "SST", "SST0", "SSTB", "SSTF", "SSTH", "SSTJ", "SSTK", "SSTL", "SSTM", "SSTN", "SSTP", "SSTR", "SSTS", "SSTT", "SSTW", "SSTX", "SSTY", "SSW", "SSW0", "SSWB", "SSWF", "SSWJ", "SSWK", "SSWL", "SSWM", "SSWN", "SSWP", "SSWR", "SSWS", "SSWT", "SSWX", "SSX", "SSXB", "SSXF", "SSXK", "SSXL", "SSXM", "SSXN", "SSXP", "SSXR", "SSXS", "SSXT", "SSXW", "SSXX", "SSY", "SSYN", "SSYR", "SSYS", "SX", "SX0B", "SX0R", "SX0T", "SXB", "SXBH", "SXBL", "SXBN", "SXBR", "SXBS", "SXF", "SXFL", "SXFM", "SXFN", "SXFR", "SXFS", "SXFT", "SXHN", "SXJM", "SXK", "SXKB", "SXKF", "SXKH", "SXKK", "SXKL", "SXKN", "SXKR", "SXKS", "SXKT", "SXKX", "SXL", "SXLB", "SXLF", "SXLH", "SXLK", "SXLL", "SXLM", "SXLN", "SXLP", "SXLR", "SXLS", "SXLT", "SXLW", "SXLX", "SXM", "SXMH", "SXMK", "SXML", "SXMN", "SXMR", "SXMS", "SXN", "SXNB", "SXNF", "SXNH", "SXNJ", "SXNK", "SXNL", "SXNN", "SXNP", "SXNR", "SXNS", "SXNT", "SXP", "SXPB", "SXPF", "SXPH", "SXPK", "SXPL", "SXPM", "SXPN", "SXPR", "SXPS", "SXPT", "SXPW", "SXPY", "SXR", "SXR0", "SXRB", "SXRF", "SXRH", "SXRJ", "SXRK", "SXRL", "SXRM", "SXRN", "SXRP", "SXRR", "SXRS", "SXRT", "SXRW", "SXRX", "SXS", "SXSF", "SXSK", "SXSM", "SXSP", "SXSR", "SXSS", "SXST", "SXT", "SXTB", "SXTF", "SXTH", "SXTK", "SXTL", "SXTN", "SXTP", "SXTR", "SXTS", "SXTT", "SXTW", "SXWL", "SXWR", "SXWT", "SXXN", "SXXT", "SXYR", "T0", "T00", "T0B", "T0BB", "T0BK", "T0BL", "T0BM", "T0BN", "T0BP", "T0BR", "T0BS", "T0BT", "T0BW", "T0BX", "T0F", "T0FF", "T0FK", "T0FL", "T0FN", "T0FR", "T0FS", "T0H0", "T0HB", "T0HF", "T0HL", "T0HM", "T0HR", "T0HT", "T0HX", "T0JB", "T0JK", "T0JN", "T0JP", "T0JR", "T0JS", "T0JT", "T0K", "T0KB", "T0KF", "T0KK", "T0KL", "T0KM", "T0KN", "T0KP", "T0KR", "T0KS", "T0KT", "T0KX", "T0L", "T0L0", "T0LB", "T0LF", "T0LJ", "T0LK", "T0LM", "T0LN", "T0LP", "T0LR", "T0LS", "T0LT", "T0LX", "T0LY", "T0M", "T0MJ", "T0MK", "T0ML", "T0MN", "T0MP", "T0MR", "T0MS", "T0MT", "T0MX", "T0N", "T0NB", "T0NF", "T0NJ", "T0NK", "T0NL", "T0NM", "T0NN", "T0NP", "T0NR", "T0NS", "T0NT", "T0NW", "T0NX", "T0P", "T0PF", "T0PK", "T0PL", "T0PN", "T0PP", "T0PR", "T0PS", "T0PT", "T0PX", "T0R", "T0RB", "T0RF", "T0RH", "T0RJ", "T0RK", "T0RL", "T0RM", "T0RN", "T0RP", "T0RR", "T0RS", "T0RT", "T0RW", "T0RX", "T0RY", "T0S", "T0S0", "T0SB", "T0SF", "T0SJ", "T0SK", "T0SL", "T0SM", "T0SN", "T0SP", "T0SR", "T0SS", "T0ST", "T0SW", "T0SX", "T0T", "T0TB", "T0TF", "T0TK", "T0TL", "T0TM", "T0TN", "T0TP", "T0TR", "T0TS", "T0TT", "T0TW", "T0W", "T0WF", "T0WL", "T0WN", "T0WR", "T0WT", "T0WX", "T0X", "T0XL", "T0XM", "T0XN", "T0XP", "T0XR", "T0XS", "T0XT", "T0Y", "T0YM", "T0YN", "T0YR", "T0YX", "TT", "TT0", "TT0L", "TT0M", "TT0R", "TT0S", "TTB", "TTB0", "TTBB", "TTBF", "TTBK", "TTBL", "TTBM", "TTBN", "TTBR", "TTBS", "TTBT", "TTBX", "TTF", "TTFF", "TTFH", "TTFK", "TTFL", "TTFM", "TTFN", "TTFR", "TTFS", "TTFT", "TTFW", "TTH", "TTHL", "TTHN", "TTHR", "TTHS", "TTHT", "TTHX", "TTJ", "TTJK", "TTJL", "TTJM", "TTJN", "TTJR", "TTJS", "TTJT", "TTJW", "TTK", "TTKB", "TTKF", "TTKH", "TTKK", "TTKL", "TTKM", "TTKN", "TTKP", "TTKR", "TTKS", "TTKT", "TTKW", "TTKY", "TTL", "TTL0", "TTLB", "TTLF", "TTLH", "TTLJ", "TTLK", "TTLL", "TTLM", "TTLN", "TTLP", "TTLR", "TTLS", "TTLT", "TTLW", "TTLX", "TTLY", "TTM", "TTM0", "TTMB", "TTMF", "TTMH", "TTMJ", "TTMK", "TTML", "TTMM", "TTMN", "TTMP", "TTMR", "TTMS", "TTMT", "TTMW", "TTMX", "TTMY", "TTN", "TTN0", "TTNB", "TTNF", "TTNH", "TTNJ", "TTNK", "TTNL", "TTNM", "TTNN", "TTNP", "TTNR", "TTNS", "TTNT", "TTNW", "TTNX", "TTNY", "TTP", "TTPB", "TTPF", "TTPH", "TTPK", "TTPL", "TTPM", "TTPN", "TTPP", "TTPR", "TTPS", "TTPT", "TTPW", "TTPX", "TTPY", "TTR", "TTR0", "TTRB", "TTRF", "TTRH", "TTRJ", "TTRK", "TTRL", "TTRM", "TTRN", "TTRP", "TTRR", "TTRS", "TTRT", "TTRW", "TTRX", "TTRY", "TTS", "TTSB", "TTSF", "TTSH", "TTSK", "TTSL", "TTSM", "TTSN", "TTSP", "TTSR", "TTSS", "TTST", "TTSW", "TTSX", "TTT", "TTTB", "TTTF", "TTTH", "TTTJ", "TTTK", "TTTL", "TTTM", "TTTN", "TTTP", "TTTR", "TTTS", "TTTT", "TTTW", "TTTX", "TTTY", "TTW", "TTW0", "TTWB", "TTWF", "TTWH", "TTWK", "TTWL", "TTWM", "TTWN", "TTWP", "TTWR", "TTWS", "TTWT", "TTWW", "TTWX", "TTX", "TTXB", "TTXF", "TTXK", "TTXL", "TTXN", "TTXR", "TTXS", "TTY", "TTYB", "TTYK", "TTYL", "TTYM", "TTYN", "TTYP", "TTYR", "TTYS", "TTYT", "TX", "TXBN", "TXFL", "TXLR", "TXM", "TXML", "TXN", "TXNR", "TXPS", "TXR", "TXRL", "TXRN", "TXTK", "UU0M", "UU0R", "UU0W", "UUB", "UUBB", "UUBR", "UUFL", "UUFM", "UUFN", "UUFR", "UUFS", "UUFT", "UUK", "UUKL", "UUKM", "UUKN", "UUKR", "UUKS", "UUKX", "UUL", "UUL0", "UULB", "UULF", "UULJ", "UULK", "UULL", "UULM", "UULN", "UULP", "UULR", "UULS", "UULT", "UULW", "UULY", "UUM", "UUMF", "UUMK", "UUML", "UUMN", "UUMP", "UUMR", "UUMW", "UUN", "UUN0", "UUNF", "UUNJ", "UUNK", "UUNL", "UUNM", "UUNN", "UUNP", "UUNR", "UUNS", "UUNT", "UUNW", "UUNY", "UUP0", "UUPF", "UUPL", "UUPM", "UUPN", "UUPR", "UUPS", "UUPT", "UUPW", "UUPX", "UUR", "UURB", "UURJ", "UURK", "UURL", "UURM", "UURN", "UURP", "UURR", "UURS", "UURT", "UURW", "UURX", "UUSK", "UUSL", "UUSN", "UUSR", "UUST", "UUT", "UUTJ", "UUTK", "UUTL", "UUTN", "UUTP", "UUTR", "UUTS", "UUTY", "UUW", "UUWL", "UUWR", "UUXK", "UUXR", "VF", "VFB", "VFBL", "VFBN", "VFBR", "VFF", "VFFH", "VFFK", "VFFL", "VFFN", "VFFR", "VFFS", "VFFT", "VFFX", "VFFY", "VFHL", "VFJ", "VFJF", "VFJL", "VFJM", "VFJN", "VFJS", "VFK", "VFKB", "VFKK", "VFKL", "VFKN", "VFKR", "VFKS", "VFKT", "VFKX", "VFL", "VFL0", "VFLB", "VFLF", "VFLH", "VFLJ", "VFLK", "VFLL", "VFLM", "VFLN", "VFLP", "VFLR", "VFLS", "VFLT", "VFLW", "VFLX", "VFM", "VFMN", "VFMP", "VFMR", "VFMS", "VFMT", "VFN", "VFN0", "VFNB", "VFNF", "VFNH", "VFNJ", "VFNK", "VFNL", "VFNM", "VFNN", "VFNP", "VFNR", "VFNS", "VFNT", "VFNW", "VFNX", "VFNY", "VFP", "VFPN", "VFPR", "VFR", "VFRB", "VFRF", "VFRH", "VFRJ", "VFRK", "VFRL", "VFRM", "VFRN", "VFRP", "VFRR", "VFRS", "VFRT", "VFRW", "VFRX", "VFRY", "VFS", "VFSF", "VFSH", "VFSJ", "VFSK", "VFSL", "VFSM", "VFSN", "VFSP", "VFSR", "VFST", "VFSX", "VFSY", "VFT", "VFTB", "VFTF", "VFTH", "VFTK", "VFTL", "VFTM", "VFTN", "VFTR", "VFTS", "VFTT", "VFTX", "VFWL", "VFWT", "VFX", "VFXN", "VFXR", "VFXS", "VFY", "VFYJ", "VFYL", "W", "W0BR", "W0S", "WBLN", "WBNK", "WBR", "WBRB", "WBRN", "WBRT", "WFL", "WFLK", "WFLS", "WFLT", "WFRN", "WHTR", "WJ", "WJBL", "WJMS", "WKHM", "WKHT", "WKKS", "WKLF", "WKLS", "WKLW", "WKM", "WKMP", "WKN", "WKNT", "WKRB", "WKS", "WL", "WLB", "WLKR", "WLM", "WLMR", "WLN", "WLNT", "WLPN", "WLPR", "WLR", "WLRS", "WLS", "WLT", "WLTS", "WLTW", "WLXR", "WLY", "WM", "WMFR", "WMHF", "WMLR", "WMLT", "WMN", "WMNT", "WMR", "WMRK", "WMST", "WN", "WNBR", "WNFL", "WNFR", "WNHM", "WNJL", "WNKR", "WNKT", "WNL", "WNM", "WNMN", "WNN", "WNNT", "WNRK", "WNRL", "WNS", "WNSR", "WNST", "WNT", "WNTB", "WNTH", "WNTK", "WNTL", "WNTN", "WNTR", "WNTS", "WNTT", "WNTY", "WNWR", "WNWT", "WNY", "WNYR", "WPMP", "WPR", "WPRF", "WR", "WR0", "WR0L", "WR0M", "WR0S", "WRBR", "WRFR", "WRFT", "WRJR", "WRK", "WRKB", "WRKL", "WRKN", "WRKR", "WRKS", "WRL", "WRLF", "WRM", "WRM0", "WRMK", "WRN", "WRNF", "WRNJ", "WRNK", "WRNS", "WRNT", "WRNX", "WRP", "WRS", "WRSB", "WRST", "WRT", "WRTK", "WRTL", "WRTN", "WRTS", "WS", "WSFR", "WSLS", "WSS", "WSXL", "WTKS", "WTKT", "WTL", "WTLR", "WTN", "WTR", "WTRK", "WTTY", "WTWL", "WW", "WW0", "WW0B", "WW0K", "WW0L", "WW0M", "WW0N", "WW0R", "WW0W", "WWB", "WWBH", "WWBK", "WWBL", "WWBM", "WWBN", "WWBP", "WWBR", "WWBS", "WWBT", "WWBW", "WWBX", "WWBY", "WWF", "WWFB", "WWFH", "WWFK", "WWFL", "WWFM", "WWFN", "WWFP", "WWFR", "WWFS", "WWFT", "WWFX", "WWH", "WWHF", "WWHM", "WWHN", "WWHP", "WWHT", "WWJ", "WWJB", "WWJK", "WWJL", "WWJN", "WWJR", "WWJS", "WWJT", "WWJW", "WWK", "WWKB", "WWKF", "WWKH", "WWKK", "WWKL", "WWKM", "WWKN", "WWKP", "WWKR", "WWKS", "WWKT", "WWKW", "WWKY", "WWL", "WWL0", "WWLB", "WWLF", "WWLH", "WWLJ", "WWLK", "WWLL", "WWLM", "WWLN", "WWLP", "WWLR", "WWLS", "WWLT", "WWLW", "WWLX", "WWLY", "WWM", "WWM0", "WWMB", "WWMF", "WWMJ", "WWMK", "WWML", "WWMN", "WWMP", "WWMR", "WWMS", "WWMT", "WWMW", "WWMY", "WWN", "WWN0", "WWNB", "WWNF", "WWNH", "WWNJ", "WWNK", "WWNL", "WWNM", "WWNN", "WWNP", "WWNR", "WWNS", "WWNT", "WWNW", "WWNX", "WWNY", "WWP", "WWPB", "WWPF", "WWPH", "WWPK", "WWPL", "WWPM", "WWPN", "WWPP", "WWPR", "WWPS", "WWPT", "WWPW", "WWR", "WWR0", "WWRB", "WWRF", "WWRH", "WWRJ", "WWRK", "WWRL", "WWRM", "WWRN", "WWRP", "WWRR", "WWRS", "WWRT", "WWRW", "WWRX", "WWRY", "WWS", "WWS0", "WWSB", "WWSF", "WWSK", "WWSL", "WWSM", "WWSN", "WWSP", "WWSR", "WWSS", "WWST", "WWSW", "WWSX", "WWT", "WWT0", "WWTB", "WWTF", "WWTH", "WWTJ", "WWTK", "WWTL", "WWTM", "WWTN", "WWTP", "WWTR", "WWTS", "WWTT", "WWTW", "WWTX", "WWTY", "WWW", "WWWB", "WWWK", "WWWL", "WWWM", "WWWN", "WWWR", "WWX", "WWXB", "WWXF", "WWXH", "WWXK", "WWXL", "WWXM", "WWXN", "WWXP", "WWXR", "WWXS", "WWXT", "WWXW", "WWY", "WWYL", "WWYM", "WWYN", "WWYR", "WWYT", "WX", "WXBR", "WXKR", "WXL", "WXNK", "WXPR", "WXT", "WXTL", "WXWT", "WY", "WY0", "WYB", "WYFR", "WYK", "WYKK", "WYKT", "WYL", "WYLK", "WYLN", "WYLS", "WYLT", "WYM", "WYMB", "WYMN", "WYMP", "WYN", "WYNB", "WYNK", "WYNN", "WYNT", "WYP", "WYR", "WYRJ", "WYRM", "WYS", "WYT", "WYTF", "WYTP", "WYTR", "WYTS", "XSFR", "XSHF", "XSMS", "XSN", "XSN0", "XSNK", "XSNL", "XSNN", "XSNT", "XSRB", "Y", "YFN", "YFRT", "YFS", "YFT", "YMK", "YN", "YPRS", "YRM", "YSNT", "YST0", "YSTL", "YY", "YY0", "YY0L", "YY0N", "YY0P", "YY0R", "YYB", "YYBK", "YYBL", "YYBM", "YYBN", "YYBR", "YYBS", "YYBT", "YYFL", "YYFN", "YYFR", "YYH", "YYJK", "YYJL", "YYJN", "YYJR", "YYK", "YYKB", "YYKK", "YYKL", "YYKM", "YYKN", "YYKP", "YYKR", "YYKS", "YYKT", "YYKX", "YYL", "YYLB", "YYLF", "YYLH", "YYLJ", "YYLK", "YYLL", "YYLM", "YYLN", "YYLP", "YYLR", "YYLS", "YYLT", "YYLW", "YYLY", "YYM", "YYMB", "YYMK", "YYML", "YYMN", "YYMP", "YYMR", "YYMS", "YYMT", "YYMX", "YYMY", "YYN", "YYN0", "YYNB", "YYNF", "YYNJ", "YYNK", "YYNL", "YYNM", "YYNN", "YYNP", "YYNR", "YYNS", "YYNT", "YYNW", "YYNX", "YYNY", "YYP", "YYPK", "YYPL", "YYPN", "YYPR", "YYPS", "YYPT", "YYR", "YYRB", "YYRF", "YYRH", "YYRJ", "YYRK", "YYRL", "YYRM", "YYRN", "YYRP", "YYRR", "YYRS", "YYRT", "YYRW", "YYRX", "YYRY", "YYS", "YYSB", "YYSF", "YYSK", "YYSM", "YYSN", "YYSP", "YYSR", "YYST", "YYSW", "YYT", "YYTB", "YYTF", "YYTJ", "YYTK", "YYTL", "YYTM", "YYTN", "YYTP", "YYTR", "YYTS", "YYTY", "YYW", "YYWK", "YYWL", "YYWN", "YYWP", "YYWR", "YYX", "YYXT", "YYY", "YYYH", "YYYK", "YYYN", "YYYT", "ZS", "ZSB", "ZSBK", "ZSBL", "ZSBN", "ZSBR", "ZSF", "ZSFL", "ZSFN", "ZSFR", "ZSFS", "ZSFT", "ZSH", "ZSHL", "ZSHN", "ZSHR", "ZSJL", "ZSJN", "ZSK", "ZSKF", "ZSKH", "ZSKK", "ZSKL", "ZSKN", "ZSKR", "ZSKS", "ZSKW", "ZSKX", "ZSL", "ZSLB", "ZSLF", "ZSLK", "ZSLM", "ZSLN", "ZSLR", "ZSLS", "ZSLT", "ZSM", "ZSML", "ZSMN", "ZSMP", "ZSMR", "ZSMS", "ZSMT", "ZSN", "ZSN0", "ZSNB", "ZSNF", "ZSNJ", "ZSNK", "ZSNL", "ZSNN", "ZSNR", "ZSNS", "ZSNT", "ZSP", "ZSPF", "ZSPK", "ZSPL", "ZSPN", "ZSPP", "ZSPS", "ZSR", "ZSRB", "ZSRF", "ZSRK", "ZSRL", "ZSRM", "ZSRN", "ZSRS", "ZSRT", "ZSRX", "ZSS", "ZSSM", "ZSSN", "ZSSS", "ZSST", "ZSSX", "ZST", "ZSTK", "ZSTL", "ZSTN", "ZSTP", "ZSTR", "ZSTS", "ZSTT", "ZSTX", "ZSWK", "ZSWR", "ZSWS", "ZSX", "ZSXN", "ZSXR", "ZSXS", "ZSY"];
    }
  });

  // src/geocode.ts
  var geocode_exports = {};
  __export(geocode_exports, {
    default: () => geocode
  });

  // node_modules/minisearch/dist/es5m/index.js
  var __assign = function() {
    __assign = Object.assign || function __assign2(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m)
      return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function() {
          if (o && i >= o.length)
            o = void 0;
          return { value: o && o[i++], done: !o };
        }
      };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m)
      return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"]))
          m.call(i);
      } finally {
        if (e)
          throw e.error;
      }
    }
    return ar;
  }
  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  }
  var ENTRIES = "ENTRIES";
  var KEYS = "KEYS";
  var VALUES = "VALUES";
  var LEAF = "";
  var TreeIterator = function() {
    function TreeIterator2(set, type) {
      var node = set._tree;
      var keys = Object.keys(node);
      this.set = set;
      this._type = type;
      this._path = keys.length > 0 ? [{ node, keys }] : [];
    }
    TreeIterator2.prototype.next = function() {
      var value = this.dive();
      this.backtrack();
      return value;
    };
    TreeIterator2.prototype.dive = function() {
      if (this._path.length === 0) {
        return { done: true, value: void 0 };
      }
      var _a2 = last$1(this._path), node = _a2.node, keys = _a2.keys;
      if (last$1(keys) === LEAF) {
        return { done: false, value: this.result() };
      }
      this._path.push({ node: node[last$1(keys)], keys: Object.keys(node[last$1(keys)]) });
      return this.dive();
    };
    TreeIterator2.prototype.backtrack = function() {
      if (this._path.length === 0) {
        return;
      }
      last$1(this._path).keys.pop();
      if (last$1(this._path).keys.length > 0) {
        return;
      }
      this._path.pop();
      this.backtrack();
    };
    TreeIterator2.prototype.key = function() {
      return this.set._prefix + this._path.map(function(_a2) {
        var keys = _a2.keys;
        return last$1(keys);
      }).filter(function(key) {
        return key !== LEAF;
      }).join("");
    };
    TreeIterator2.prototype.value = function() {
      return last$1(this._path).node[LEAF];
    };
    TreeIterator2.prototype.result = function() {
      if (this._type === VALUES) {
        return this.value();
      }
      if (this._type === KEYS) {
        return this.key();
      }
      return [this.key(), this.value()];
    };
    TreeIterator2.prototype[Symbol.iterator] = function() {
      return this;
    };
    return TreeIterator2;
  }();
  var last$1 = function(array) {
    return array[array.length - 1];
  };
  var NONE = 0;
  var CHANGE = 1;
  var ADD = 2;
  var DELETE = 3;
  var fuzzySearch = function(node, query, maxDistance) {
    var stack = [{ distance: 0, i: 0, key: "", node }];
    var results = {};
    var innerStack = [];
    var _loop_1 = function() {
      var _a2 = stack.pop(), node_1 = _a2.node, distance = _a2.distance, key = _a2.key, i = _a2.i, edit = _a2.edit;
      Object.keys(node_1).forEach(function(k) {
        if (k === LEAF) {
          var totDistance = distance + (query.length - i);
          var _a3 = __read(results[key] || [null, Infinity], 2), d = _a3[1];
          if (totDistance <= maxDistance && totDistance < d) {
            results[key] = [node_1[k], totDistance];
          }
        } else {
          withinDistance(query, k, maxDistance - distance, i, edit, innerStack).forEach(function(_a4) {
            var d2 = _a4.distance, i2 = _a4.i, edit2 = _a4.edit;
            stack.push({ node: node_1[k], distance: distance + d2, key: key + k, i: i2, edit: edit2 });
          });
        }
      });
    };
    while (stack.length > 0) {
      _loop_1();
    }
    return results;
  };
  var withinDistance = function(a, b, maxDistance, i, edit, stack) {
    stack.push({ distance: 0, ia: i, ib: 0, edit });
    var results = [];
    while (stack.length > 0) {
      var _a2 = stack.pop(), distance = _a2.distance, ia = _a2.ia, ib = _a2.ib, edit_1 = _a2.edit;
      if (ib === b.length) {
        results.push({ distance, i: ia, edit: edit_1 });
        continue;
      }
      if (a[ia] === b[ib]) {
        stack.push({ distance, ia: ia + 1, ib: ib + 1, edit: NONE });
      } else {
        if (distance >= maxDistance) {
          continue;
        }
        if (edit_1 !== ADD) {
          stack.push({ distance: distance + 1, ia, ib: ib + 1, edit: DELETE });
        }
        if (ia < a.length) {
          if (edit_1 !== DELETE) {
            stack.push({ distance: distance + 1, ia: ia + 1, ib, edit: ADD });
          }
          if (edit_1 !== DELETE && edit_1 !== ADD) {
            stack.push({ distance: distance + 1, ia: ia + 1, ib: ib + 1, edit: CHANGE });
          }
        }
      }
    }
    return results;
  };
  var SearchableMap = function() {
    function SearchableMap2(tree, prefix) {
      if (tree === void 0) {
        tree = {};
      }
      if (prefix === void 0) {
        prefix = "";
      }
      this._tree = tree;
      this._prefix = prefix;
    }
    SearchableMap2.prototype.atPrefix = function(prefix) {
      var _a2;
      if (!prefix.startsWith(this._prefix)) {
        throw new Error("Mismatched prefix");
      }
      var _b = __read(trackDown(this._tree, prefix.slice(this._prefix.length)), 2), node = _b[0], path = _b[1];
      if (node === void 0) {
        var _c = __read(last(path), 2), parentNode = _c[0], key_1 = _c[1];
        var nodeKey = Object.keys(parentNode).find(function(k) {
          return k !== LEAF && k.startsWith(key_1);
        });
        if (nodeKey !== void 0) {
          return new SearchableMap2((_a2 = {}, _a2[nodeKey.slice(key_1.length)] = parentNode[nodeKey], _a2), prefix);
        }
      }
      return new SearchableMap2(node || {}, prefix);
    };
    SearchableMap2.prototype.clear = function() {
      delete this._size;
      this._tree = {};
    };
    SearchableMap2.prototype.delete = function(key) {
      delete this._size;
      return remove(this._tree, key);
    };
    SearchableMap2.prototype.entries = function() {
      return new TreeIterator(this, ENTRIES);
    };
    SearchableMap2.prototype.forEach = function(fn) {
      var e_1, _a2;
      try {
        for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
          var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
          fn(key, value, this);
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (_c && !_c.done && (_a2 = _b.return))
            _a2.call(_b);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
    };
    SearchableMap2.prototype.fuzzyGet = function(key, maxEditDistance) {
      return fuzzySearch(this._tree, key, maxEditDistance);
    };
    SearchableMap2.prototype.get = function(key) {
      var node = lookup(this._tree, key);
      return node !== void 0 ? node[LEAF] : void 0;
    };
    SearchableMap2.prototype.has = function(key) {
      var node = lookup(this._tree, key);
      return node !== void 0 && node.hasOwnProperty(LEAF);
    };
    SearchableMap2.prototype.keys = function() {
      return new TreeIterator(this, KEYS);
    };
    SearchableMap2.prototype.set = function(key, value) {
      if (typeof key !== "string") {
        throw new Error("key must be a string");
      }
      delete this._size;
      var node = createPath(this._tree, key);
      node[LEAF] = value;
      return this;
    };
    Object.defineProperty(SearchableMap2.prototype, "size", {
      get: function() {
        var _this = this;
        if (this._size) {
          return this._size;
        }
        this._size = 0;
        this.forEach(function() {
          _this._size += 1;
        });
        return this._size;
      },
      enumerable: false,
      configurable: true
    });
    SearchableMap2.prototype.update = function(key, fn) {
      if (typeof key !== "string") {
        throw new Error("key must be a string");
      }
      delete this._size;
      var node = createPath(this._tree, key);
      node[LEAF] = fn(node[LEAF]);
      return this;
    };
    SearchableMap2.prototype.values = function() {
      return new TreeIterator(this, VALUES);
    };
    SearchableMap2.prototype[Symbol.iterator] = function() {
      return this.entries();
    };
    SearchableMap2.from = function(entries) {
      var e_2, _a2;
      var tree = new SearchableMap2();
      try {
        for (var entries_1 = __values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
          var _b = __read(entries_1_1.value, 2), key = _b[0], value = _b[1];
          tree.set(key, value);
        }
      } catch (e_2_1) {
        e_2 = { error: e_2_1 };
      } finally {
        try {
          if (entries_1_1 && !entries_1_1.done && (_a2 = entries_1.return))
            _a2.call(entries_1);
        } finally {
          if (e_2)
            throw e_2.error;
        }
      }
      return tree;
    };
    SearchableMap2.fromObject = function(object) {
      return SearchableMap2.from(Object.entries(object));
    };
    return SearchableMap2;
  }();
  var trackDown = function(tree, key, path) {
    if (path === void 0) {
      path = [];
    }
    if (key.length === 0 || tree == null) {
      return [tree, path];
    }
    var nodeKey = Object.keys(tree).find(function(k) {
      return k !== LEAF && key.startsWith(k);
    });
    if (nodeKey === void 0) {
      path.push([tree, key]);
      return trackDown(void 0, "", path);
    }
    path.push([tree, nodeKey]);
    return trackDown(tree[nodeKey], key.slice(nodeKey.length), path);
  };
  var lookup = function(tree, key) {
    if (key.length === 0 || tree == null) {
      return tree;
    }
    var nodeKey = Object.keys(tree).find(function(k) {
      return k !== LEAF && key.startsWith(k);
    });
    if (nodeKey === void 0) {
      return void 0;
    }
    return lookup(tree[nodeKey], key.slice(nodeKey.length));
  };
  var createPath = function(tree, key) {
    var _a2;
    if (key.length === 0 || tree == null) {
      return tree;
    }
    var nodeKey = Object.keys(tree).find(function(k) {
      return k !== LEAF && key.startsWith(k);
    });
    if (nodeKey === void 0) {
      var toSplit = Object.keys(tree).find(function(k) {
        return k !== LEAF && k.startsWith(key[0]);
      });
      if (toSplit === void 0) {
        tree[key] = {};
      } else {
        var prefix = commonPrefix(key, toSplit);
        tree[prefix] = (_a2 = {}, _a2[toSplit.slice(prefix.length)] = tree[toSplit], _a2);
        delete tree[toSplit];
        return createPath(tree[prefix], key.slice(prefix.length));
      }
      return tree[key];
    }
    return createPath(tree[nodeKey], key.slice(nodeKey.length));
  };
  var commonPrefix = function(a, b, i, length, prefix) {
    if (i === void 0) {
      i = 0;
    }
    if (length === void 0) {
      length = Math.min(a.length, b.length);
    }
    if (prefix === void 0) {
      prefix = "";
    }
    if (i >= length) {
      return prefix;
    }
    if (a[i] !== b[i]) {
      return prefix;
    }
    return commonPrefix(a, b, i + 1, length, prefix + a[i]);
  };
  var remove = function(tree, key) {
    var _a2 = __read(trackDown(tree, key), 2), node = _a2[0], path = _a2[1];
    if (node === void 0) {
      return;
    }
    delete node[LEAF];
    var keys = Object.keys(node);
    if (keys.length === 0) {
      cleanup(path);
    }
    if (keys.length === 1) {
      merge(path, keys[0], node[keys[0]]);
    }
  };
  var cleanup = function(path) {
    if (path.length === 0) {
      return;
    }
    var _a2 = __read(last(path), 2), node = _a2[0], key = _a2[1];
    delete node[key];
    var keys = Object.keys(node);
    if (keys.length === 0) {
      cleanup(path.slice(0, -1));
    }
    if (keys.length === 1 && keys[0] !== LEAF) {
      merge(path.slice(0, -1), keys[0], node[keys[0]]);
    }
  };
  var merge = function(path, key, value) {
    if (path.length === 0) {
      return;
    }
    var _a2 = __read(last(path), 2), node = _a2[0], nodeKey = _a2[1];
    node[nodeKey + key] = value;
    delete node[nodeKey];
  };
  var last = function(array) {
    return array[array.length - 1];
  };
  var _a;
  var OR = "or";
  var AND = "and";
  var AND_NOT = "and_not";
  var MiniSearch = function() {
    function MiniSearch2(options) {
      if ((options === null || options === void 0 ? void 0 : options.fields) == null) {
        throw new Error('MiniSearch: option "fields" must be provided');
      }
      this._options = __assign(__assign(__assign({}, defaultOptions), options), { searchOptions: __assign(__assign({}, defaultSearchOptions), options.searchOptions || {}) });
      this._index = new SearchableMap();
      this._documentCount = 0;
      this._documentIds = {};
      this._fieldIds = {};
      this._fieldLength = {};
      this._averageFieldLength = {};
      this._nextId = 0;
      this._storedFields = {};
      this.addFields(this._options.fields);
    }
    MiniSearch2.prototype.add = function(document) {
      var _this = this;
      var _a2 = this._options, extractField = _a2.extractField, tokenize = _a2.tokenize, processTerm = _a2.processTerm, fields = _a2.fields, idField = _a2.idField;
      var id = extractField(document, idField);
      if (id == null) {
        throw new Error('MiniSearch: document does not have ID field "'.concat(idField, '"'));
      }
      var shortDocumentId = this.addDocumentId(id);
      this.saveStoredFields(shortDocumentId, document);
      fields.forEach(function(field) {
        var fieldValue = extractField(document, field);
        if (fieldValue == null) {
          return;
        }
        var tokens = tokenize(fieldValue.toString(), field);
        _this.addFieldLength(shortDocumentId, _this._fieldIds[field], _this.documentCount - 1, tokens.length);
        tokens.forEach(function(term) {
          var processedTerm = processTerm(term, field);
          if (processedTerm) {
            _this.addTerm(_this._fieldIds[field], shortDocumentId, processedTerm);
          }
        });
      });
    };
    MiniSearch2.prototype.addAll = function(documents) {
      var _this = this;
      documents.forEach(function(document) {
        return _this.add(document);
      });
    };
    MiniSearch2.prototype.addAllAsync = function(documents, options) {
      var _this = this;
      if (options === void 0) {
        options = {};
      }
      var _a2 = options.chunkSize, chunkSize = _a2 === void 0 ? 10 : _a2;
      var acc = { chunk: [], promise: Promise.resolve() };
      var _b = documents.reduce(function(_a3, document, i) {
        var chunk2 = _a3.chunk, promise2 = _a3.promise;
        chunk2.push(document);
        if ((i + 1) % chunkSize === 0) {
          return {
            chunk: [],
            promise: promise2.then(function() {
              return new Promise(function(resolve) {
                return setTimeout(resolve, 0);
              });
            }).then(function() {
              return _this.addAll(chunk2);
            })
          };
        } else {
          return { chunk: chunk2, promise: promise2 };
        }
      }, acc), chunk = _b.chunk, promise = _b.promise;
      return promise.then(function() {
        return _this.addAll(chunk);
      });
    };
    MiniSearch2.prototype.remove = function(document) {
      var _this = this;
      var _a2 = this._options, tokenize = _a2.tokenize, processTerm = _a2.processTerm, extractField = _a2.extractField, fields = _a2.fields, idField = _a2.idField;
      var id = extractField(document, idField);
      if (id == null) {
        throw new Error('MiniSearch: document does not have ID field "'.concat(idField, '"'));
      }
      var _b = __read(Object.entries(this._documentIds).find(function(_a3) {
        var _b2 = __read(_a3, 2);
        _b2[0];
        var longId = _b2[1];
        return id === longId;
      }) || [], 1), shortDocumentId = _b[0];
      if (shortDocumentId == null) {
        throw new Error("MiniSearch: cannot remove document with ID ".concat(id, ": it is not in the index"));
      }
      fields.forEach(function(field) {
        var fieldValue = extractField(document, field);
        if (fieldValue == null) {
          return;
        }
        var tokens = tokenize(fieldValue.toString(), field);
        tokens.forEach(function(term) {
          var processedTerm = processTerm(term, field);
          if (processedTerm) {
            _this.removeTerm(_this._fieldIds[field], shortDocumentId, processedTerm);
          }
        });
        _this.removeFieldLength(shortDocumentId, _this._fieldIds[field], _this.documentCount, tokens.length);
      });
      delete this._storedFields[shortDocumentId];
      delete this._documentIds[shortDocumentId];
      delete this._fieldLength[shortDocumentId];
      this._documentCount -= 1;
    };
    MiniSearch2.prototype.removeAll = function(documents) {
      var _this = this;
      if (documents) {
        documents.forEach(function(document) {
          return _this.remove(document);
        });
      } else if (arguments.length > 0) {
        throw new Error("Expected documents to be present. Omit the argument to remove all documents.");
      } else {
        this._index = new SearchableMap();
        this._documentCount = 0;
        this._documentIds = {};
        this._fieldLength = {};
        this._averageFieldLength = {};
        this._storedFields = {};
        this._nextId = 0;
      }
    };
    MiniSearch2.prototype.search = function(query, searchOptions) {
      var _this = this;
      if (searchOptions === void 0) {
        searchOptions = {};
      }
      var combinedResults = this.executeQuery(query, searchOptions);
      return Object.entries(combinedResults).reduce(function(results, _a2) {
        var _b = __read(_a2, 2), docId = _b[0], _c = _b[1], score2 = _c.score, match = _c.match, terms = _c.terms;
        var result = {
          id: _this._documentIds[docId],
          terms: uniq(terms),
          score: score2,
          match
        };
        Object.assign(result, _this._storedFields[docId]);
        if (searchOptions.filter == null || searchOptions.filter(result)) {
          results.push(result);
        }
        return results;
      }, []).sort(function(_a2, _b) {
        var a = _a2.score;
        var b = _b.score;
        return a < b ? 1 : -1;
      });
    };
    MiniSearch2.prototype.autoSuggest = function(queryString, options) {
      if (options === void 0) {
        options = {};
      }
      options = __assign(__assign({}, defaultAutoSuggestOptions), options);
      var suggestions = this.search(queryString, options).reduce(function(suggestions2, _a2) {
        var score2 = _a2.score, terms = _a2.terms;
        var phrase = terms.join(" ");
        if (suggestions2[phrase] == null) {
          suggestions2[phrase] = { score: score2, terms, count: 1 };
        } else {
          suggestions2[phrase].score += score2;
          suggestions2[phrase].count += 1;
        }
        return suggestions2;
      }, {});
      return Object.entries(suggestions).map(function(_a2) {
        var _b = __read(_a2, 2), suggestion = _b[0], _c = _b[1], score2 = _c.score, terms = _c.terms, count = _c.count;
        return { suggestion, terms, score: score2 / count };
      }).sort(function(_a2, _b) {
        var a = _a2.score;
        var b = _b.score;
        return a < b ? 1 : -1;
      });
    };
    Object.defineProperty(MiniSearch2.prototype, "documentCount", {
      get: function() {
        return this._documentCount;
      },
      enumerable: false,
      configurable: true
    });
    MiniSearch2.loadJSON = function(json, options) {
      if (options == null) {
        throw new Error("MiniSearch: loadJSON should be given the same options used when serializing the index");
      }
      return MiniSearch2.loadJS(JSON.parse(json), options);
    };
    MiniSearch2.getDefault = function(optionName) {
      if (defaultOptions.hasOwnProperty(optionName)) {
        return getOwnProperty(defaultOptions, optionName);
      } else {
        throw new Error('MiniSearch: unknown option "'.concat(optionName, '"'));
      }
    };
    MiniSearch2.loadJS = function(js, options) {
      var index = js.index, documentCount = js.documentCount, nextId = js.nextId, documentIds = js.documentIds, fieldIds = js.fieldIds, fieldLength = js.fieldLength, averageFieldLength = js.averageFieldLength, storedFields = js.storedFields;
      var miniSearch2 = new MiniSearch2(options);
      miniSearch2._index = new SearchableMap(index._tree, index._prefix);
      miniSearch2._documentCount = documentCount;
      miniSearch2._nextId = nextId;
      miniSearch2._documentIds = documentIds;
      miniSearch2._fieldIds = fieldIds;
      miniSearch2._fieldLength = fieldLength;
      miniSearch2._averageFieldLength = averageFieldLength;
      miniSearch2._fieldIds = fieldIds;
      miniSearch2._storedFields = storedFields || {};
      return miniSearch2;
    };
    MiniSearch2.prototype.executeQuery = function(query, searchOptions) {
      var _this = this;
      if (searchOptions === void 0) {
        searchOptions = {};
      }
      if (typeof query === "string") {
        return this.executeSearch(query, searchOptions);
      } else {
        var results = query.queries.map(function(subquery) {
          var options = __assign(__assign(__assign({}, searchOptions), query), { queries: void 0 });
          return _this.executeQuery(subquery, options);
        });
        return this.combineResults(results, query.combineWith);
      }
    };
    MiniSearch2.prototype.executeSearch = function(queryString, searchOptions) {
      var _this = this;
      if (searchOptions === void 0) {
        searchOptions = {};
      }
      var _a2 = this._options, tokenize = _a2.tokenize, processTerm = _a2.processTerm, globalSearchOptions = _a2.searchOptions;
      var options = __assign(__assign({ tokenize, processTerm }, globalSearchOptions), searchOptions);
      var searchTokenize = options.tokenize, searchProcessTerm = options.processTerm;
      var terms = searchTokenize(queryString).map(function(term) {
        return searchProcessTerm(term);
      }).filter(function(term) {
        return !!term;
      });
      var queries = terms.map(termToQuerySpec(options));
      var results = queries.map(function(query) {
        return _this.executeQuerySpec(query, options);
      });
      return this.combineResults(results, options.combineWith);
    };
    MiniSearch2.prototype.executeQuerySpec = function(query, searchOptions) {
      var _this = this;
      var options = __assign(__assign({}, this._options.searchOptions), searchOptions);
      var boosts = (options.fields || this._options.fields).reduce(function(boosts2, field) {
        var _a3;
        return __assign(__assign({}, boosts2), (_a3 = {}, _a3[field] = getOwnProperty(boosts2, field) || 1, _a3));
      }, options.boost || {});
      var boostDocument = options.boostDocument, weights = options.weights, maxFuzzy = options.maxFuzzy;
      var _a2 = __assign(__assign({}, defaultSearchOptions.weights), weights), fuzzyWeight = _a2.fuzzy, prefixWeight = _a2.prefix;
      var exactMatch = this.termResults(query.term, boosts, boostDocument, this._index.get(query.term));
      if (!query.fuzzy && !query.prefix) {
        return exactMatch;
      }
      var results = [exactMatch];
      if (query.prefix) {
        this._index.atPrefix(query.term).forEach(function(term, data) {
          var weightedDistance = 0.3 * (term.length - query.term.length) / term.length;
          results.push(_this.termResults(term, boosts, boostDocument, data, prefixWeight, weightedDistance));
        });
      }
      if (query.fuzzy) {
        var fuzzy = query.fuzzy === true ? 0.2 : query.fuzzy;
        var maxDistance = fuzzy < 1 ? Math.min(maxFuzzy, Math.round(query.term.length * fuzzy)) : fuzzy;
        Object.entries(this._index.fuzzyGet(query.term, maxDistance)).forEach(function(_a3) {
          var _b = __read(_a3, 2), term = _b[0], _c = __read(_b[1], 2), data = _c[0], distance = _c[1];
          var weightedDistance = distance / term.length;
          results.push(_this.termResults(term, boosts, boostDocument, data, fuzzyWeight, weightedDistance));
        });
      }
      return results.reduce(combinators[OR]);
    };
    MiniSearch2.prototype.combineResults = function(results, combineWith) {
      if (combineWith === void 0) {
        combineWith = OR;
      }
      if (results.length === 0) {
        return {};
      }
      var operator = combineWith.toLowerCase();
      return results.reduce(combinators[operator]) || {};
    };
    MiniSearch2.prototype.toJSON = function() {
      return {
        index: this._index,
        documentCount: this._documentCount,
        nextId: this._nextId,
        documentIds: this._documentIds,
        fieldIds: this._fieldIds,
        fieldLength: this._fieldLength,
        averageFieldLength: this._averageFieldLength,
        storedFields: this._storedFields
      };
    };
    MiniSearch2.prototype.termResults = function(term, boosts, boostDocument, indexData, weight, editDistance) {
      var _this = this;
      if (editDistance === void 0) {
        editDistance = 0;
      }
      if (indexData == null) {
        return {};
      }
      return Object.entries(boosts).reduce(function(results, _a2) {
        var _b = __read(_a2, 2), field = _b[0], boost = _b[1];
        var fieldId = _this._fieldIds[field];
        var _c = indexData[fieldId] || { ds: {} }, df = _c.df, ds = _c.ds;
        Object.entries(ds).forEach(function(_a3) {
          var _b2 = __read(_a3, 2), documentId = _b2[0], tf = _b2[1];
          var docBoost = boostDocument ? boostDocument(_this._documentIds[documentId], term) : 1;
          if (!docBoost) {
            return;
          }
          var normalizedLength = _this._fieldLength[documentId][fieldId] / _this._averageFieldLength[fieldId];
          results[documentId] = results[documentId] || { score: 0, match: {}, terms: [] };
          results[documentId].terms.push(term);
          results[documentId].match[term] = getOwnProperty(results[documentId].match, term) || [];
          results[documentId].score += docBoost * score(tf, df, _this._documentCount, normalizedLength, boost, editDistance);
          results[documentId].match[term].push(field);
        });
        return results;
      }, {});
    };
    MiniSearch2.prototype.addTerm = function(fieldId, documentId, term) {
      this._index.update(term, function(indexData) {
        var _a2;
        indexData = indexData || {};
        var fieldIndex = indexData[fieldId] || { df: 0, ds: {} };
        if (fieldIndex.ds[documentId] == null) {
          fieldIndex.df += 1;
        }
        fieldIndex.ds[documentId] = (fieldIndex.ds[documentId] || 0) + 1;
        return __assign(__assign({}, indexData), (_a2 = {}, _a2[fieldId] = fieldIndex, _a2));
      });
    };
    MiniSearch2.prototype.removeTerm = function(fieldId, documentId, term) {
      var _this = this;
      if (!this._index.has(term)) {
        this.warnDocumentChanged(documentId, fieldId, term);
        return;
      }
      this._index.update(term, function(indexData) {
        var _a2;
        var fieldIndex = indexData[fieldId];
        if (fieldIndex == null || fieldIndex.ds[documentId] == null) {
          _this.warnDocumentChanged(documentId, fieldId, term);
          return indexData;
        }
        if (fieldIndex.ds[documentId] <= 1) {
          if (fieldIndex.df <= 1) {
            delete indexData[fieldId];
            return indexData;
          }
          fieldIndex.df -= 1;
        }
        if (fieldIndex.ds[documentId] <= 1) {
          delete fieldIndex.ds[documentId];
          return indexData;
        }
        fieldIndex.ds[documentId] -= 1;
        return __assign(__assign({}, indexData), (_a2 = {}, _a2[fieldId] = fieldIndex, _a2));
      });
      if (Object.keys(this._index.get(term)).length === 0) {
        this._index.delete(term);
      }
    };
    MiniSearch2.prototype.warnDocumentChanged = function(shortDocumentId, fieldId, term) {
      if (console == null || console.warn == null) {
        return;
      }
      var fieldName = Object.entries(this._fieldIds).find(function(_a2) {
        var _b = __read(_a2, 2);
        _b[0];
        var id = _b[1];
        return id === fieldId;
      })[0];
      console.warn("MiniSearch: document with ID ".concat(this._documentIds[shortDocumentId], ' has changed before removal: term "').concat(term, '" was not present in field "').concat(fieldName, '". Removing a document after it has changed can corrupt the index!'));
    };
    MiniSearch2.prototype.addDocumentId = function(documentId) {
      var shortDocumentId = this._nextId.toString(36);
      this._documentIds[shortDocumentId] = documentId;
      this._documentCount += 1;
      this._nextId += 1;
      return shortDocumentId;
    };
    MiniSearch2.prototype.addFields = function(fields) {
      var _this = this;
      fields.forEach(function(field, i) {
        _this._fieldIds[field] = i;
      });
    };
    MiniSearch2.prototype.addFieldLength = function(documentId, fieldId, count, length) {
      this._averageFieldLength[fieldId] = this._averageFieldLength[fieldId] || 0;
      var totalLength = this._averageFieldLength[fieldId] * count + length;
      this._fieldLength[documentId] = this._fieldLength[documentId] || {};
      this._fieldLength[documentId][fieldId] = length;
      this._averageFieldLength[fieldId] = totalLength / (count + 1);
    };
    MiniSearch2.prototype.removeFieldLength = function(documentId, fieldId, count, length) {
      var totalLength = this._averageFieldLength[fieldId] * count - length;
      this._averageFieldLength[fieldId] = totalLength / (count - 1);
    };
    MiniSearch2.prototype.saveStoredFields = function(documentId, doc) {
      var _this = this;
      var _a2 = this._options, storeFields = _a2.storeFields, extractField = _a2.extractField;
      if (storeFields == null || storeFields.length === 0) {
        return;
      }
      this._storedFields[documentId] = this._storedFields[documentId] || {};
      storeFields.forEach(function(fieldName) {
        var fieldValue = extractField(doc, fieldName);
        if (fieldValue === void 0) {
          return;
        }
        _this._storedFields[documentId][fieldName] = fieldValue;
      });
    };
    return MiniSearch2;
  }();
  var getOwnProperty = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property) ? object[property] : void 0;
  };
  var combinators = (_a = {}, _a[OR] = function(a, b) {
    return Object.entries(b).reduce(function(combined, _a2) {
      var _b;
      var _c = __read(_a2, 2), documentId = _c[0], _d = _c[1], score2 = _d.score, match = _d.match, terms = _d.terms;
      if (combined[documentId] == null) {
        combined[documentId] = { score: score2, match, terms };
      } else {
        combined[documentId].score += score2;
        combined[documentId].score *= 1.5;
        (_b = combined[documentId].terms).push.apply(_b, __spreadArray([], __read(terms), false));
        Object.assign(combined[documentId].match, match);
      }
      return combined;
    }, a || {});
  }, _a[AND] = function(a, b) {
    return Object.entries(b).reduce(function(combined, _a2) {
      var _b = __read(_a2, 2), documentId = _b[0], _c = _b[1], score2 = _c.score, match = _c.match, terms = _c.terms;
      if (a[documentId] === void 0) {
        return combined;
      }
      combined[documentId] = combined[documentId] || {};
      combined[documentId].score = a[documentId].score + score2;
      combined[documentId].match = __assign(__assign({}, a[documentId].match), match);
      combined[documentId].terms = __spreadArray(__spreadArray([], __read(a[documentId].terms), false), __read(terms), false);
      return combined;
    }, {});
  }, _a[AND_NOT] = function(a, b) {
    return Object.entries(b).reduce(function(combined, _a2) {
      var _b = __read(_a2, 2), documentId = _b[0], _c = _b[1];
      _c.score;
      _c.match;
      _c.terms;
      delete combined[documentId];
      return combined;
    }, a || {});
  }, _a);
  var tfIdf = function(tf, df, n) {
    return tf * Math.log(n / df);
  };
  var score = function(termFrequency, documentFrequency, documentCount, normalizedLength, boost, editDistance) {
    var weight = boost / (1 + 0.333 * boost * editDistance);
    return weight * tfIdf(termFrequency, documentFrequency, documentCount) / normalizedLength;
  };
  var termToQuerySpec = function(options) {
    return function(term, i, terms) {
      var fuzzy = typeof options.fuzzy === "function" ? options.fuzzy(term, i, terms) : options.fuzzy || false;
      var prefix = typeof options.prefix === "function" ? options.prefix(term, i, terms) : options.prefix === true;
      return { term, fuzzy, prefix };
    };
  };
  var uniq = function(array) {
    return array.filter(function(element, i, array2) {
      return array2.indexOf(element) === i;
    });
  };
  var defaultOptions = {
    idField: "id",
    extractField: function(document, fieldName) {
      return document[fieldName];
    },
    tokenize: function(text, fieldName) {
      return text.split(SPACE_OR_PUNCTUATION);
    },
    processTerm: function(term, fieldName) {
      return term.toLowerCase();
    },
    fields: void 0,
    searchOptions: void 0,
    storeFields: []
  };
  var defaultSearchOptions = {
    combineWith: OR,
    prefix: false,
    fuzzy: false,
    maxFuzzy: 6,
    boost: {},
    weights: { fuzzy: 0.9, prefix: 0.75 }
  };
  var defaultAutoSuggestOptions = {
    prefix: function(term, i, terms) {
      return i === terms.length - 1;
    }
  };
  var SPACE_OR_PUNCTUATION = /[\n\r -#%-*,-/:;?@[-\]_{}\u00A0\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u1680\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2000-\u200A\u2010-\u2029\u202F-\u2043\u2045-\u2051\u2053-\u205F\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u3000-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]+/u;

  // src/geocode.ts
  var import_latlon_geohash = __toESM(require_latlon_geohash());
  var import_metaphone = __toESM(require_metaphone());
  var knownGroups = new Set(require_groups());
  var currentGroup = null;
  var currentGroupData = null;
  var fetchController = new AbortController();
  var miniSearch = new MiniSearch({ fields: ["address"] });
  var searchIndexDocuments = [];
  var currentSearchIndexKey = null;
  function getSearchIndexKey(group, numericWords) {
    return [group, ...numericWords.sort()].join("|");
  }
  function getGroup(word) {
    let cleanedWord = word.toUpperCase().replace(/[^A-Z]+/g, "");
    let group = cleanedWord.substring(0, 1) + (0, import_metaphone.default)(cleanedWord).substring(0, 3);
    return knownGroups.has(group) ? group : null;
  }
  function loadGroupData(group) {
    return new Promise((resolve, reject) => {
      if (group === currentGroup && currentGroupData) {
        resolve(currentGroupData);
        return;
      }
      fetchController.abort();
      fetchController = new AbortController();
      currentGroup = group;
      let url = `https://www.abc.net.au/res/sites/news-projects/geocoder/data/202111/${group}.txt.gz`;
      fetch(url, { signal: fetchController.signal }).then((response) => {
        response.text().then((data) => {
          currentGroupData = data;
          resolve(data);
        });
      }).catch((e) => {
        if (e.name !== "AbortError")
          reject(e);
      });
    });
  }
  function prepareSearchIndex(group, numericWords) {
    return new Promise((resolve, reject) => {
      let newSearchIndexKey = getSearchIndexKey(group, numericWords);
      if (newSearchIndexKey === currentSearchIndexKey) {
        resolve();
        return;
      }
      loadGroupData(group).then((data) => {
        var _a2;
        searchIndexDocuments = [];
        let id = 0;
        let lines = data.split("\n");
        for (let line of lines) {
          let street;
          try {
            street = JSON.parse(line);
          } catch {
            continue;
          }
          let addressLines = [
            "",
            "",
            [street.s, street.t, street.p].join(" ")
          ];
          for (let block of street.b) {
            addressLines[1] = [
              block.l ? "LOT " : "",
              block.m ? block.n + "-" + block.m + " " : block.n + " ",
              street.a + " ",
              street.r ? street.r : "",
              street.x ? " " + street.x : ""
            ].join("");
            addressLines[0] = (_a2 = block.a) != null ? _a2 : "";
            let address = addressLines.filter((line2) => !!line2).join(", ");
            let indexThisBlock = numericWords.length === 0 || numericWords.some((w) => w === block.n || w === block.m || w === street.p);
            if (indexThisBlock) {
              searchIndexDocuments[id] = {
                id,
                address,
                geohash: block.g,
                numericWords: block.m ? [block.n, block.m, street.p] : [block.n, street.p]
              };
              id++;
            }
            if (block.u && numericWords.length > 0) {
              for (let unitType in block.u) {
                let unitNumbers = block.u[unitType];
                if (unitType)
                  unitType += " ";
                for (let unitNumber of unitNumbers) {
                  if (Array.isArray(unitNumber) && unitNumber.length === 2) {
                    for (let i = unitNumber[0]; i <= unitNumber[1]; i++) {
                      let indexThisUnit = indexThisBlock || numericWords.some((w) => w === i);
                      if (indexThisUnit) {
                        searchIndexDocuments[id] = {
                          id,
                          address: unitType + i + ", " + address,
                          geohash: block.g,
                          numericWords: block.m ? [i, block.n, block.m, +street.p] : [i, block.n, +street.p]
                        };
                        id++;
                      }
                    }
                  } else {
                    let indexThisUnit = indexThisBlock || numericWords.some((w) => w === unitNumber);
                    if (indexThisUnit) {
                      searchIndexDocuments[id] = {
                        id,
                        address: unitType + unitNumber + ", " + address,
                        geohash: block.g,
                        numericWords: block.m ? [unitNumber, block.n, block.m, +street.p] : [unitNumber, block.n, +street.p]
                      };
                      id++;
                    }
                  }
                }
              }
            }
          }
          if (id > 1e4) {
            break;
          }
        }
        miniSearch.removeAll();
        miniSearch.addAll(searchIndexDocuments);
        resolve();
      }).catch(reject);
    });
  }
  var states = /* @__PURE__ */ new Set(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]);
  var prettyAddress = (address) => {
    return address.toUpperCase().replace(/(^|[^A-Z])(['A-Z]+)/g, (entireMatch, separator, word) => {
      let prettyWord = states.has(word) ? word : word.substring(0, 1) + word.substring(1).toLowerCase();
      return separator + prettyWord;
    });
  };
  function geocode(input, options = {}) {
    return new Promise((resolve, reject) => {
      let startTime = Date.now();
      let cleanedInput = input.replace(/'/g, "").replace(/[^\w\d]+/g, " ").replace(/\s+/g, " ").toUpperCase();
      let words = cleanedInput.split(" ").map((word) => isFinite(+word) ? +word : word);
      let numericWords = [];
      let streetName = null;
      for (let word of words) {
        let isNumeric = typeof word === "number" || /\d/.test(word);
        if (isNumeric) {
          numericWords.push(word);
        } else if (streetName === null && typeof word === "string" && word.length > 3 && numericWords.length > 0) {
          streetName = word;
        }
      }
      if (streetName === null) {
        let firstWord = words.find((word) => typeof word === "string" && !/\d/.test(word));
        if (firstWord && typeof firstWord === "string") {
          streetName = firstWord;
        }
      }
      let result = {
        results: [],
        group: "",
        input,
        duration: 0
      };
      let group = streetName === null ? null : getGroup(streetName);
      if (streetName === null || group === null) {
        result.duration = Date.now() - startTime;
        resolve(result);
        return;
      }
      prepareSearchIndex(group, numericWords).then(() => {
        var _a2;
        let miniSearchResults = miniSearch.search(input, {
          fuzzy: (term) => /\d/.test(term) ? false : 0.333,
          prefix: (term) => /\d/.test(term) ? false : true,
          weights: { fuzzy: 0.1, prefix: 0.5 },
          filter: numericWords.length === 0 ? void 0 : (result2) => {
            let doc = searchIndexDocuments[result2.id];
            if (doc && doc.numericWords.length > 0) {
              for (let inputWord of numericWords) {
                for (let docWord of doc.numericWords) {
                  if (inputWord === docWord) {
                    return true;
                  }
                }
              }
            }
            return false;
          }
        });
        let highestScoreIsPositive = ((_a2 = miniSearchResults[0]) == null ? void 0 : _a2.score) > 0;
        for (let miniSearchResult of miniSearchResults) {
          if (miniSearchResult.score === 0 && highestScoreIsPositive) {
            break;
          }
          let doc = searchIndexDocuments[miniSearchResult.id];
          let g = import_latlon_geohash.default.decode(doc.geohash);
          result.results.push({
            address: prettyAddress(doc.address),
            latitude: g.lat,
            longitude: g.lon,
            score: miniSearchResult.score,
            id: doc.id
          });
          if (result.results.length === options.limit) {
            break;
          }
        }
        result.duration = Date.now() - startTime;
        resolve(result);
      }).catch(reject);
    });
  }
  return __toCommonJS(geocode_exports);
})();
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
