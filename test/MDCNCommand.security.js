const { expect } = require("chai");

describe("MDCNCommand authorization", function () {
  async function deploy() {
    const [strategic, operational, tactical, outsider] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MDCNCommand");
    const command = await Factory.deploy();
    await command.deployed();

    await command.setRoleAndBranch(operational.address, 2, 1);
    await command.setRoleAndBranch(tactical.address, 3, 1);

    return { command, strategic, operational, tactical, outsider };
  }

  it("allows Strategic to send every layer", async function () {
    const { command } = await deploy();

    await expect(command.sendCommand(1, 1, 1, "strategic")).to.not.be.reverted;
    await expect(command.sendCommand(2, 1, 1, "operational")).to.not.be.reverted;
    await expect(command.sendCommand(3, 1, 1, "tactical")).to.not.be.reverted;
  });

  it("prevents lower-clearance roles from sending higher-level commands", async function () {
    const { command, operational, tactical } = await deploy();

    await expect(command.connect(operational).sendCommand(1, 1, 1, "blocked")).to.be.revertedWith(
      "Unauthorized: insufficient role"
    );
    await expect(command.connect(tactical).sendCommand(1, 1, 1, "blocked")).to.be.revertedWith(
      "Unauthorized: insufficient role"
    );
  });

  it("allows each role to send its own layer and lower-priority layers", async function () {
    const { command, operational, tactical } = await deploy();

    await expect(command.connect(operational).sendCommand(2, 1, 1, "ops")).to.not.be.reverted;
    await expect(command.connect(operational).sendCommand(3, 1, 1, "tactical")).to.not.be.reverted;
    await expect(command.connect(tactical).sendCommand(3, 1, 1, "tactical")).to.not.be.reverted;
  });

  it("rejects invalid command layers", async function () {
    const { command } = await deploy();

    await expect(command.sendCommand(0, 1, 1, "invalid")).to.be.revertedWith("Invalid command layer");
    await expect(command.sendCommand(4, 1, 1, "invalid")).to.be.revertedWith("Invalid command layer");
  });
});
