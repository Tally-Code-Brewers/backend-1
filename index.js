const express = require("express");
const Docker = require("dockerode");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

const docker = new Docker();

app.post("/run", async (req, res) => {
  const { language, code, input } = req.body;

  let imageName;
  let command;
  const formattedCode = code.replace(/"/g, '\\"').replace(/\n/g, "\\n");
  const formattedInput = input
    ? input.replace(/"/g, '\\"').replace(/\n/g, "\\n")
    : "";

  switch (language) {
    case "python":
      imageName = "python-runner";
      command = [
        "sh",
        "-c",
        `echo "${formattedCode}" > script.py && echo "${formattedInput}" > input.txt && /usr/bin/time -v python script.py < input.txt`,
      ];
      break;
    case "cpp":
      imageName = "cpp-runner";
      command = [
        "sh",
        "-c",
        `echo "${formattedCode}" > main.cpp && g++ main.cpp -o main && echo "${formattedInput}" > input.txt && /usr/bin/time -v ./main < input.txt`,
      ];
      break;
    case "javascript":
      imageName = "node:latest";
      command = [
        "sh",
        "-c",
        `echo "${formattedCode}" > script.js && echo "${formattedInput}" > input.txt && /usr/bin/time -v node script.js < input.txt`,
      ];
      break;
    case "java":
      imageName = "java-runner";
      command = [
        "sh",
        "-c",
        `echo "${formattedCode}" > Main.java && javac Main.java && echo "${formattedInput}" > input.txt && /usr/bin/time -v java Main < input.txt`,
      ];
      break;
    default:
      return res.status(400).json({ error: "Unsupported language" });
  }

  try {
    const timeout = 2000; // 2 seconds

    const container = await docker.createContainer({
      Image: imageName,
      Cmd: command,
      Tty: false,
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
    });

    await container.start();

    let programOutput = "";
    let timingOutput = "";
    let isTiming = false;

    stream.on("data", (data) => {
      const strData = data.toString();
      if (strData.includes("Command being timed:")) {
        isTiming = true;
      }
      if (isTiming) {
        timingOutput += strData;
      } else {
        programOutput += strData;
      }
    });

    // Set up a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Time limit exceeded")), timeout)
    );

    // Run the Docker container and race against the timeout
    await Promise.race([
      (async () => {
        await container.wait();
        await container.remove();
      })(),
      timeoutPromise,
    ]);

    // Clean up the timing output
    timingOutput = timingOutput.replace(/[^\x20-\x7E\n]/g, "");

    // Parse the timing output
    const parseMetrics = (str) => {
      const lines = str.split("\n");
      const metrics = {};

      lines.forEach((line) => {
        const [key, value] = line.split(":");
        if (key && value) {
          metrics[key.trim()] = value.trim();
        }
      });

      return metrics;
    };

    const parsedMetrics = parseMetrics(timingOutput);
    const cleanedOutput = programOutput.replace(/[^\x20-\x7E]/g, "");

    // Combine program output and metrics
    const result = {
      output: cleanedOutput.trim(),
      metrics: parsedMetrics,
    };

    res.json(result);
  } catch (error) {
    if (error.message === "Time limit exceeded") {
      res.json({ output: "Time limit exceeded" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.post("/hey", (req, res) => {
  res.json({ output: "hey" });
});

app.listen(3000, process.env.HOST, () => {
  console.log("Server running on port 3000");
});
