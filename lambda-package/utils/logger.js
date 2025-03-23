"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston = __importStar(require("winston"));
const config_1 = require("../config");
// Configure Winston logger
exports.logger = winston.createLogger({
    level: config_1.config.logLevel,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service: 'solar-data-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.printf(({ level, message, timestamp, ...meta }) => {
                return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
            }))
        })
    ]
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsc0NBQW1DO0FBRW5DLDJCQUEyQjtBQUNkLFFBQUEsTUFBTSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7SUFDekMsS0FBSyxFQUFFLGVBQU0sQ0FBQyxRQUFRO0lBQ3RCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FDNUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFDMUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FDdEI7SUFDRCxXQUFXLEVBQUUsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUU7SUFDOUMsVUFBVSxFQUFFO1FBQ1YsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztZQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQzVCLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQ3pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQzFCLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLEVBQUU7Z0JBQy9ELE9BQU8sR0FBRyxTQUFTLElBQUksS0FBSyxLQUFLLE9BQU8sSUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3BELEVBQUUsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUNIO1NBQ0YsQ0FBQztLQUNIO0NBQ0YsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgd2luc3RvbiBmcm9tICd3aW5zdG9uJztcclxuaW1wb3J0IHsgY29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJztcclxuXHJcbi8vIENvbmZpZ3VyZSBXaW5zdG9uIGxvZ2dlclxyXG5leHBvcnQgY29uc3QgbG9nZ2VyID0gd2luc3Rvbi5jcmVhdGVMb2dnZXIoe1xyXG4gIGxldmVsOiBjb25maWcubG9nTGV2ZWwsXHJcbiAgZm9ybWF0OiB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxyXG4gICAgd2luc3Rvbi5mb3JtYXQudGltZXN0YW1wKCksXHJcbiAgICB3aW5zdG9uLmZvcm1hdC5qc29uKClcclxuICApLFxyXG4gIGRlZmF1bHRNZXRhOiB7IHNlcnZpY2U6ICdzb2xhci1kYXRhLXNlcnZpY2UnIH0sXHJcbiAgdHJhbnNwb3J0czogW1xyXG4gICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKHtcclxuICAgICAgZm9ybWF0OiB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxyXG4gICAgICAgIHdpbnN0b24uZm9ybWF0LmNvbG9yaXplKCksXHJcbiAgICAgICAgd2luc3Rvbi5mb3JtYXQudGltZXN0YW1wKCksXHJcbiAgICAgICAgd2luc3Rvbi5mb3JtYXQucHJpbnRmKCh7IGxldmVsLCBtZXNzYWdlLCB0aW1lc3RhbXAsIC4uLm1ldGEgfSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGAke3RpbWVzdGFtcH0gJHtsZXZlbH06ICR7bWVzc2FnZX0gJHtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMobWV0YSkubGVuZ3RoID8gSlNPTi5zdHJpbmdpZnkobWV0YSkgOiAnJ1xyXG4gICAgICAgICAgfWA7XHJcbiAgICAgICAgfSlcclxuICAgICAgKVxyXG4gICAgfSlcclxuICBdXHJcbn0pO1xyXG4iXX0=