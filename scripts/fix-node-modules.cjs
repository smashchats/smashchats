#!/usr/bin/env node

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

exec(
    `grep -r 'require("punycode")' .`,
    { cwd: "node_modules" },
    (error, stdout, stderr) => {
        if (error) {
            if (
                !error.message.startsWith("Command failed: grep -r 'require(\"punycode\")' .")
            ) {
                console.error(`Error: ${error.message}`);
            }
            return;
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }
        console.log(stdout);

        stdout
            .split("\n")
            .filter((line) => line !== "")
            .forEach((line) => {
                const [file] = line.split(":");

                const filePath = path.join(process.cwd(), "node_modules", file);

                console.log(
                    `replacing require("punycode") with require("punycode/") in ${filePath}`
                );

                const fileContent = fs.readFileSync(filePath, "utf8");
                const newFileContent = fileContent.replace(
                    /require\("punycode"\)/,
                    'require("punycode/")'
                );
                fs.writeFileSync(filePath, newFileContent);
            });
    }
);
