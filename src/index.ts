import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "node:fs";
import path from "node:path";
import mime from "mime-types";
import dotenv from "dotenv";

dotenv.config();

import readline from "node:readline";
import { TestContext } from "node:test";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", tools: [
        {
            codeExecution: {}
        }
    ]
});

function promptAI() {
    rl.question("Prompt:> ", async function (prompt) {

        if (prompt.toLocaleLowerCase() == "exit") {
            rl.close();
            console.log("You are exit...");
            return;
        }

        const result = await model.generateContent(prompt);

        console.log(`Output:> ${result.response.text()}`);

        promptAI();
    });
}

function imagePromptAI() {

    function fileToGenerativePart(filePath: string, fileType: string) {
        return {
            inlineData: {
                data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
                mimeType: fileType,
            },
        };
    }

    function getFileFullPath(fileName: string) {
        const files = fs.readdirSync("src/assets/images");

        for (let file of files) {
            if (file == fileName) {
                return path.join(path.resolve("src/assets/images"), fileName);
            }
        }

        return "File not found put your file in src/assets/images diractory."
    }

    rl.question("File name:> ", function (fileName) {
        if (fileName === "exit") {
            rl.close();
            console.log("You are exit...");
            return;
        }
        rl.question("Prompt:> ", async function (prompt) {
            const filePath = getFileFullPath(fileName);
            const fileType = mime.lookup(filePath);

            if (!fileType) {
                console.log("Invalid file type.");
                return;
            }

            const imagePart = fileToGenerativePart(filePath, fileType);

            const result = await model.generateContent([prompt, imagePart]);
            console.log(`Output:> ${result.response.text()}`);

            imagePromptAI();
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
        } else if (modelName == "image prompting") {
            imagePromptAI();
        }
    })
}

run_genAI()


