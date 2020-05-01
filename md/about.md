# About

The Modeling Covid team is comprised of data scientists and engineers [Will Bunting](https://www.linkedin.com/in/willbunting/), [Daryl Koopersmith](https://www.linkedin.com/in/darylkoopersmith/), [Dara Straussman](https://www.linkedin.com/in/dara-straussman/), and [Ken Henisey](https://www.linkedin.com/in/kenhenisey/). The model code is open-source and available on [GitHub](https://github.com/wbunting/covidmodel/blob/master/model/Covid-model.nb).

We’d like to thank the following epidemiologists and researchers for their guidance:

- [Dr. Marc Lipsitch](https://www.hsph.harvard.edu/marc-lipsitch/), [Dr. Yonatan Grad](https://www.hsph.harvard.edu/yonatan-grad/), [Dr. Stephen Kissler](https://www.hsph.harvard.edu/stephen-kissler/), and [Christine Tedijanto](https://ccdd.hsph.harvard.edu/people/christine-tedijanto/) at Harvard for their feedback and original [mathematical model](https://dash.harvard.edu/bitstream/handle/1/42638988/Social%20distancing%20strategies%20for%20curbing%20the%20Covid-19%20epidemic.pdf?sequence=1&isAllowed=y).
- [Dr. Silvana Konermann](https://biochemistry.stanford.edu/silvana-konermann) at Stanford for her research and continued support.

## Model

The model evaluated here is a standard epidemiological model called SEIR. It models the spread of a virus in four states:

- Susceptible (healthy, non-immune people),
- Exposed (infected, but cannot infect others),
- Infectious
- Recovered (or deceased)

In our model we ignore the natural birth and death rates in the population for simplicity but also because the R0 (basic reproduction rate) of Covid-19 is high ~3.1 and therefore demographic shifts play a minimal role in the short term effect. We also follow [a recent study](https://dash.harvard.edu/bitstream/handle/1/42638988/Social%20distancing%20strategies%20for%20curbing%20the%20Covid-19%20epidemic.pdf?sequence=1&isAllowed=y) out of Harvard [0] in separating states for infected individuals when they need hospitalization or ICU care. This allows us to, after fitting the model, predict when a given country or state will run out of ICU beds.

We also incorporate a best-guess age weighting to the Harvard model to get a more accurate estimate on the ICU bed needs, e.g. in states / countries with a higher proportion of elderly individuals.

The model is not without its limitations. For example, the model takes an “exponential decay” between the different states, this is likely a good first order approximation, but has its limitations (e.g. you don’t have any real patients that take longer than say 1 month to resolve the disease).

## Parameter fitting

The parameters we use to forecast both state and country level are fit using country level data from the United States, Spain, France, and Italy. In particular we omit data from Asia where mitigation strategies have been quite different to-date and it’s unclear whether we would need to enhance the model to properly account for things like mask usage.

## Forecasts

After fitting the model parameters we generate forward looking forecasts in a number of mitigation scenarios for each state / country. In particular the forecasts include forecasted cumulative PCR and death counts as well as ICU bed utilization at points in the future. We assume that ICU capacity is 2x the number of ventilator in a given administrative region.
