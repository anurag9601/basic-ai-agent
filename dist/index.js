"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const mime_types_1 = __importDefault(require("mime-types"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const node_readline_1 = __importDefault(require("node:readline"));
const rl = node_readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", tools: [
        {
            codeExecution: {}
        }
    ]
});
function promptAI() {
    rl.question("Prompt:> ", function (prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (prompt.toLocaleLowerCase() == "exit") {
                rl.close();
                console.log("You are exit...");
                return;
            }
            const result = yield model.generateContent(prompt);
            console.log(`Output:> ${result.response.text()}`);
            promptAI();
        });
    });
}
function imagePromptAI() {
    function fileToGenerativePart(filePath, fileType) {
        return {
            inlineData: {
                data: Buffer.from(node_fs_1.default.readFileSync(filePath)).toString("base64"),
                mimeType: fileType,
            },
        };
    }
    function getFileFullPath(fileName) {
        const files = node_fs_1.default.readdirSync("src/assets/images");
        for (let file of files) {
            if (file == fileName) {
                return node_path_1.default.join(node_path_1.default.resolve("src/assets/images"), fileName);
            }
        }
        console.log("File not found put your file in src/assets/images diractory.");
        return false;
    }
    rl.question("File name:> ", function (fileName) {
        if (fileName === "exit") {
            rl.close();
            console.log("You are exit...");
            return;
        }
        console.log("Image file should present in src/assets/images folder...");
        rl.question("Prompt:> ", function (prompt) {
            return __awaiter(this, void 0, void 0, function* () {
                const filePath = getFileFullPath(fileName);
                if (!filePath) {
                    rl.close();
                    return;
                }
                const fileType = mime_types_1.default.lookup(filePath);
                if (!fileType) {
                    console.log("Invalid file type.");
                    return;
                }
                const imagePart = fileToGenerativePart(filePath, fileType);
                const result = yield model.generateContent([prompt, imagePart]);
                console.log(`Output:> ${result.response.text()}`);
                imagePromptAI();
            });
        });
    });
}
function run_genAI() {
    console.log(`Which AI model you are going to use for using model type there name as in options.
        Models:
        1) prompt
        2) image prompting`);
    rl.question("Model:> ", function (modelName) {
        if (modelName === "prompt") {
            promptAI();
        }
        else if (modelName == "image prompting") {
            imagePromptAI();
        }
    });
}
run_genAI();
//Prompt to get the expiry data and menufecturing date of the product as per in the image 
// Return me only the expiry and menufecturing date as per in image in a json form and except this don't return any information about the product yes you can only return the type of product is you are able to detect and again strictly follow the json format
