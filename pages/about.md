import {Layout, Section, MDXComponents} from '../components';

<Layout>
<Section>
<MDXComponents>

# About

This model is developed by the Covid Open Source Modeling Collaboration. The model Mathematica code is open-source and available on [GitHub](https://github.com/wbunting/covidmodel/blob/master/model/COVID-model.nb).

The Covid Open Source Modeling Collaboration is comprised of:

- [Marc Lipsitch](https://www.hsph.harvard.edu/marc-lipsitch/)'s Lab at Harvard
- [Silvana Konermann](https://biochemistry.stanford.edu/silvana-konermann)'s Lab at Stanford
- [Stripe](https://stripe.com)
- [GitHub](https://github.com)

## Model

The model evaluated here is a standard epidemiological model called SEIR. It models the spread of a virus in four states:

- Susceptible (healthy, non-immune people),
- Exposed (infected, but cannot infect others),
- Infectious
- Recovered (or deceased)

In our model we ignore the natural birth and death rates in the population for simplicity but also because the R0 (basic reproduction rate) of COVID-19 is high ~3.1 and therefore demographic shifts play a minimal role in the short term effect. We also follow a recent study out of Harvard [0] in separating states for infected individuals when they need hospitalization or ICU care. This allows us to, after fitting the model, predict when a given country or state will run out of ICU beds.

We also incorporate a best-guess age weighting to the Harvard model to get a more accurate estimate on the ICU bed needs, eg. in states / countries with a higher proportion of elderly individuals.

The model is not without its limitations. For example, the model takes an "exponential decay" between the different states, this is likely a good first order approximation, but has it's limitations (eg. you don't have any real patients that take longer than say 1 month to resolve the disease).

## Parameter fitting

The parameters we use to forecast both state and country level are fit using country level data from the United States, Spain, France, and Italy. In particular we omit data from Asia where mitigation strategies have been quite different to-date and it's unclear whether we would need to enhance the model to properly account for things like mask usage.

## Forecasts

After fitting the model parameters we generate forward looking forecasts in a number of mitigation scenarios for each state / country. In particular the forecasts include forecasted cumulative PCR and death counts as well as ICU bed utilization at points in the future. We assume that ICU capacity is 2x the number of ventilator in a given administrative region.

## Citations and Data sources

[[0]](https://dash.harvard.edu/bitstream/handle/1/42638988/Social%20distancing%20strategies%20for%20curbing%20the%20COVID-19%20epidemic.pdf?sequence=1&isAllowed=y)

</MDXComponents>
</Section>
</Layout>
