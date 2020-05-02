# About

The Modeling Covid-19 team is comprised of data scientists and engineers [Will Bunting](https://www.linkedin.com/in/willbunting/), [Daryl Koopersmith](https://www.linkedin.com/in/darylkoopersmith/), [Dara Straussman](https://www.linkedin.com/in/dara-straussman/), and [Ken Henisey](https://www.linkedin.com/in/kenhenisey/).

We’d like to thank the following epidemiologists and researchers for their guidance:

- [Dr. Marc Lipsitch](https://www.hsph.harvard.edu/marc-lipsitch/), [Dr. Yonatan Grad](https://www.hsph.harvard.edu/yonatan-grad/), [Dr. Stephen Kissler](https://www.hsph.harvard.edu/stephen-kissler/), and [Christine Tedijanto](https://ccdd.hsph.harvard.edu/people/christine-tedijanto/) at Harvard for their feedback and original [mathematical model](https://dash.harvard.edu/bitstream/handle/1/42638988/Social%20distancing%20strategies%20for%20curbing%20the%20Covid-19%20epidemic.pdf?sequence=1&isAllowed=y).
- [Dr. Silvana Konermann](https://biochemistry.stanford.edu/silvana-konermann) at Stanford for her research and continued support.

## Source code and updates

The model code is open-source and available on [GitHub](https://github.com/modelingcovid/covidmodel/).

We’re currently focused on making the following updates to the model:

- **Backtesting:** We plan to surface metrics for how the model performs when we exclude data from the immediate past (with up-to-date distancing data to ensure accurate comparisons).
- **Add distribution data for R<sub>t</sub>:** This will help convey the model’s certainty around the modeled value of R<sub>t</sub> at a given point in time.
