# COSMC - Covid Open Source Modeling Collaboration

This model is intended to provide guidance on the efficiency of COVID-19 mitigation efforts.

We’ve implemented a model for the spread of the virus which is an enrichment of the basic SEIR model with adjustments for distancing and adding PCR confirmation and Fatality states. This allowes us to fit the solutions of the system of SEIR equations to actual data as reported by various states. We then use a combination of parameters from the fits and literature values to generate Monte Carlo simulations around the fit expectations to get a sense of our uncertainty in the projections. 

## How to run the model

The main model code lives in `model/model.wl` this imports the other dependencies required to run the model. First, open that file and click "Run All Code" in Mathematica. This will set up the data and helper functions required to run the model. Next, in a scratch notebook, call the function `GenerateModelExport` which takes two arguments:

- Number of simulations (set to 10 for a fast run, default is 1000)
- List of states to run (default to all states with more than 50 PCR confirmations and 5 deaths)

So for example to run three states at ten simulations you would execute `GenerateModelExport[10, {"GA","VA","MD"}]`. 

This function performs several steps:

- Fits the state PCR and fatality curves according to the model
- Evaluates the model at the expectation value of the fits + literature parameters
- Generates Monte Carlo simulations based on those expected parameter values and their errors
- Evaluates deciles for the result of the simulations
- Writes the results into per-state json files as well as some summary information in `tests/`

While it is executing it will `Echo` some plots of the fits and runtime information about which scenario it is simulating so progress can be monitored. 
