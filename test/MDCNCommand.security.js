const { expect } = require("chai");

describe("MDCNCommand authorization", function () {
  async function deploy() {
    const [strategic, operational, tactical, outsider] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MDCNCommand");
    const command = await Factory.deploy();
    await command.waitForDeployment();

    await command.setRoleAndBranch(operational.address, 2, 1);
    await command.setRoleAndBranch(tactical.address, 3, 1);
    await command.setRoleAndBranch(outsider.address, 2, 2);

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

  it("validates direct command role ordering and layer bounds", async function () {
    const { command, strategic, operational, tactical, outsider } = await deploy();

    await expect(command.connect(operational).sendDirectCommand(outsider.address, 2, "valid"))
      .to.not.be.reverted;
    await expect(command.connect(tactical).sendDirectCommand(outsider.address, 2, "blocked"))
      .to.be.revertedWith("Unauthorized: insufficient role");
    await expect(command.connect(operational).sendDirectCommand(outsider.address, 0, "invalid"))
      .to.be.revertedWith("Invalid command layer");
    await expect(command.connect(strategic).sendDirectCommand(outsider.address, 4, "invalid"))
      .to.be.revertedWith("Invalid command layer");
    await expect(command.connect(operational).sendDirectCommand(ethers.ZeroAddress, 2, "invalid"))
      .to.be.revertedWith("Invalid recipient");
  });

  it("restricts command acknowledgement to the sender or an assigned branch recipient", async function () {
    const { command, strategic, operational, tactical, outsider } = await deploy();
    await command.sendCommand(1, 2, 1, "branch command");

    await expect(command.connect(outsider).acknowledgeCommand(1))
      .to.be.revertedWith("Not authorized to acknowledge");
    await expect(command.connect(tactical).acknowledgeCommand(1)).to.not.be.reverted;
  });

  it("rejects invalid command layers", async function () {
    const { command } = await deploy();

    await expect(command.sendCommand(0, 1, 1, "invalid")).to.be.revertedWith("Invalid command layer");
    await expect(command.sendCommand(4, 1, 1, "invalid")).to.be.revertedWith("Invalid command layer");
  });
});
