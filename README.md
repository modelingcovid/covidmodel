# COVID Modeling Project

This model is intended to provide guidance on the efficiency of COVID-19 mitigation efforts.

We’ve implemented a model for the spread of the virus and fit the parameters to data at the country level from the US and Europe. We then have created state-level dashboards to help guide decision-making when it comes to mitigation efforts and ICU capacity. You can read more about the model [here](https://covidmodelingproject.com/about).


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
