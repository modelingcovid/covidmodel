# Modeling Covid-19 (MC19)

This model is intended to provide guidance on the efficiency of Covid-19 mitigation efforts.

We’ve implemented a model for the spread of the virus which is an enrichment of the basic SEIR model with adjustments for distancing and adding PCR confirmation and fatality states. This allows us to fit the solutions of the system of SEIR equations to actual data as reported by various states. We then use a combination of parameters from the fits and literature values to generate Monte Carlo simulations around the fit expectations to get a sense of our uncertainty in the projections.

## How to run the model

The main model code lives in `model/model.wl` this imports the other dependencies required to run the model. First, open that file and click "Run All Code" in Mathematica. This will set up the data and helper functions required to run the model. Next, in a scratch notebook, call the function `GenerateModelExport` which takes two arguments:

- Number of simulations (set to 10 for a fast run, default is 1000)
- List of states to run (default to all states with more than 50 PCR confirmations and 5 deaths)

So for example to run three states at ten simulations you would execute:

`GenerateModelExport[10, {"GA","VA","MD"}]`.

This function performs several steps:

- Fits the state PCR and fatality curves according to the model
- Evaluates the model at the expectation value of the fits + literature parameters
- Generates Monte Carlo simulations based on those expected parameter values and their errors
- Evaluates deciles for the result of the simulations
- Writes the results into per-state json files as well as some summary information in `tests/`

While it is executing it will `Echo` some plots of the fits and runtime information about which scenario it is simulating so progress can be monitored.

## Details of the model code

### Fitting

Fitting is done in the `evaluateState` function. We fit to the first scenario since in the past the values of the distancing function are all the same. We then replace the state specific parameters in the equations.

To perform the actual fit we extract parametric solutions to the system of differential equations for reported deaths and reported PCR confirmations. Those parametric solutions are then fit against the data where the fatalities are weighted at 3 to 1 against the PCR cases, and more recent data points are weighted higher.

The fitting algorithm used is Simulated Annealing, which is a global optimization method. This helps to avoid the model falling into some local minima which are especially present because of the nature of the distancing interpolation function that multiplies the R0 factor. We also impose a box of parameter constraints per-state to further avoid the fitting algorithm getting stuck in local minima (something we eventually hope to remove).

From the fit model we are able to extract parameter and error estimates for the natural R0 value, the importTime, a fit for state differences in testing rates, and the power of the distancing function:

- R0: the basic reporduction number -- we expect the natural value of R0 to vary across states due to cultural and demographic factors. For example states with higher population densities will likely have higher R0 values due to a higher number of interactions

- importtime: We fit the time at which we estimate 10 people were infected with Covid-19 in the state.

- stateAdjustmentForTestingDifferences: a factor that multiplies our PCR confirmed reporting functions that we expect to vary between states due to differences in testing practices. We constrain this parameter to converge over the next two months as states become more consistent in their testing

- distpow: the power of the coupling of the social distancing (from google mobile phone data) to the R0 term. We expect that relationship not to be strictly proportional and thus fit a power. We expect the effect also to vary by state in a similar way that R0 does -- eg. due to demographic factors like population density.

### Evaluation of model at expectation values for each scenario

Once the model is fit we run `evaluateScenario` which is responsible for calculating the future social distancing scenario dependent outputs of the model. Those include expectation vaules for the compartments as well as the simulations.

In addition to evaluating the model at the expected parameter values (both from fitting and from literature) we evaluate a second copy of the model which turns on `testAndTrace` for state / scenario combinations that qualify. In that case the equations set R0 to 1 after `testAndTrace` is turned on, and we record both the regular and `testAndTrace` outputs in the time series.

### Simulations

In addition to evaluating scenarios at their parameter expecation values, we generate Monte-Carlo simulated values for each of the parameters by doing random draws from distributions of those parameters (with their uncertainty, assumed 5% in cases where we don't have a good estimate of the uncertainty). These simulated parameter values are then evaluated against the parametric equation solutions to yield the model simulation outputs.

We then evaluate deciles over those simulations to produce the error bands that are seen on the site.

### Computing summary statistics and time series

Once the simulations are run we gather various time series for each of the compartments / metrics. Those being:

`expected` - the model evaluated at the expectation value
`expectedTestTrace` - the model evaluated at the expectation value in the case where test-and-trace is truned on
`percentileX` - the X percentile value of the metric at that time

We also evaluate several other metrics at both August 1st 2020 and December 31 2021 to compare against reasonable values from the literature (those being `summary` and `summaryAug`)

### Output

When running the model the `exportTimeSeries` will create a separate `.json` file for each of the metric time series in each of the state / scenario combinations. These are then consumed by our graphql API layer which enables rendering on the site.

In addition to the time series we also output `meta.json` which is a state / scenario dependent set of information (like dates of projected capacity overshoots etc). And we export a large `.csv` of all the `summary` data for easy manipulation / checking via spreadsheets.

### Testing

When the model is run we optput several test datasets into the `tests/` directory.

- `gof-metrics.csv` a set of goodness of fit metrics to evaluate how good the fitting is
- `relative-fit-errors.csv`: a plot of the relative fit errors of the model for each state to PCR and fatalities
- `hospitalizatoin-gof-metrics.csv`: a set of goodness of fit metrics to the hospitalization data(which are not fit)
- `hospitalization-relative-fit-errors.svg`: a plot of the fit errors for hospitalizations
- `summary.csv` and `summaryAug1.csv`: summary statistics for every state / scernairo combination
