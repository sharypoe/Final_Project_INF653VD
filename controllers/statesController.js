let states = require("../model/States");

// fetches all states
const fetchAllStates = async (request, response) =>
 {
  const statesDatabase = await states.find();
  let fetchedStates = request.states;
  // for handling contiguous and uncontiguous states:
  if (request.query.contig === "true") {
    fetchedStates = fetchedStates.filter(
      (state) => state.code !== "AK" && state.code !== "HI"
    );
  }  
  if (request.query.contig === "false") {
    fetchedStates = fetchedStates.filter(
      (state) => state.code === "AK" || state.code === "HI"
    );
  }

  for (let i = 0; i < fetchedStates.length; i++) {
    let foundState = statesDatabase.find(
      (state) => state.stateCode === fetchedStates[i].code
    );
    if (foundState) {
      fetchedStates[i].funfacts = foundState["funfacts"];
    }
  }
  response.status(200).json(fetchedStates);
};

// gets single state
const fetchState = async (request, response) => {
  const statesDatabase = await states.findOne({
    stateCode: request.code,
  });

  if (statesDatabase) {
    request.state.funfacts = statesDatabase.funfacts;
  }
  response.status(200).json(request.state);
};

// for /:state/funfact -> random fact
const getFunFact = async (request, response) => {
  const statesDatabase = await states.findOne({
    stateCode: request.code,
  });

  if (!statesDatabase) {
    return response.status(404).json({
      message: "No Fun Facts found for " + request.state.state,
    });
  }

  const r = Math.floor(Math.random() * statesDatabase.funfacts.length);
  const funFact = statesDatabase.funfacts[r];

  const operation = {
    funfact: funFact,
  };
  response.status(200).json(operation);
};

/**From now on, providing responses to the GET requests will be considerably easier */

// for state capital /:state/capital
const getCapital = (req, res) => {
  const operation = {
    state: req.state.state,
    capital: req.state.capital_city,
  };
  res.json(operation);
};

// for state/nickname
const getNickname = (req, res) => {
  const operation = {
    state: req.state.state,
    nickname: req.state.nickname,
  };
  res.json(operation);
};

// for state/population
const getPopulation = (req, res) => {
  const operation = {
    state: req.state.state,
    population: req.state.population.toLocaleString("en-US"),
  };

  res.json(operation);
};

// for state/admission
const getAdmission = (req, res) => {
  const operation = {
    state: req.state.state,
    admitted: req.state.admission_date.toLocaleString("en-US"),
  };

  res.json(operation);
};

/*POST request for state/funfact */
const postFunFact = async (req, res) => {
  const { funfacts } = req.body || {};

  if (!funfacts) {
    return res.status(400).json({
      message: "State fun facts value required",
    });
  }

  if (!Array.isArray(funfacts)) {
    return res.status(400).json({
      message: "State fun facts value must be an array",
    });
  }

  try {
    const s = await states.findOne({
      stateCode: req.code,
    });

    if (!s) {
      const operation = await states.create({
        stateCode: req.code,
        funfacts,
      });

      return res.status(201).json(operation);
    }

    s.funfacts = s.funfacts.concat(funfacts);
    const operation = await s.save();

    return res.status(201).json(operation);
  } catch (err) {
    console.error(err);
  }
};

/**for PATCH request*/
const updateFunFact = async (req, res) => {
  const { index, funfact } = req.body || {};
  const s = await states.findOne({
    stateCode: req.code,
  });
  const x = index - 1;

  if (!index) {
    return res.status(400).json({
      message: "State fun fact index value required",
    });
  }

  else if (!funfact) {
    return res.status(400).json({
      message: "State fun fact value required",
    });
  }

  else if (!s) {
    return res.status(404).json({
      message: `No Fun Facts found for ${req.state.state}`,
    });
  }

  else if (index > s.funfacts.length) {
    return res.status(404).json({
      message: `No Fun Fact found at that index for ${req.state.state}`,
    });
  }

  s.funfacts.splice(x, 1, funfact);
  const operation = await s.save();

  res.status(200).json(operation);
};

/*for DELETE request */
const deleteFunFact = async (req, res) => {
  const { index } = req.body || {};
  const s = await states.findOne({
    stateCode: req.code,
  });
  const x = index - 1;

  if (!index) {
    return res.status(400).json({
      message: "State fun fact index value required",
    });
  }

  else if (!s) {
    return res.status(404).json({
      message: `No Fun Facts found for ${req.state.state}`,
    });
  }

  else if (index > s.funfacts.length) {
    return res.status(404).json({
      message: `No Fun Fact found at that index for ${req.state.state}`,
    });
  }

  s.funfacts.splice(x, 1);
  const operation = await s.save();

  res.status(200).json(operation);
};

module.exports = {
  fetchAllStates,
  fetchState,
  getFunFact,
  getCapital,
  getAdmission,
  getNickname,
  getPopulation,
  postFunFact,
  deleteFunFact,
  updateFunFact,
};
