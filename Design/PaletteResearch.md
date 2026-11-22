# Osoviz Palette Research

## Selection Rule

A palette is offered for a color vision type only when its source states that it works for that type.

## Palettes

| Palette | Use | Color Vision Types | Why We Chose It |
| -- | -- | -- | -- |
| **Okabe-Ito** (default) | Categories, up to 8 items | General, Protanopia, Deuteranopia, Tritanopia | Designed to be distinguishable for all types of color vision [1], and widely used in scientific figures [2]. |
| **Paul Tol Muted** | Categories, up to 9 items | General, Protanopia, Deuteranopia | Described as color-blind safe in Tol's technical note [3], which targets red-green color blindness. |
| **Cividis** | Ordered values (dark to light), up to 6 items | General, Protanopia, Deuteranopia | Optimized for red-green color vision deficiency in a peer-reviewed paper [4]. |

- Tritanopia only gets Okabe-Ito, because the other two sources do not cover tritanopia.
- All three palettes were also checked with a color vision deficiency simulation [5] and stayed distinguishable.
- Other candidates (IBM, Viridis, D3 Category10, Tableau 10) were not used because their sources do not clearly state color-blind safety, or their role overlaps with a chosen palette.

## References

1. Okabe, M., & Ito, K. (2008). *Color Universal Design (CUD): How to make figures and presentations that are friendly to colorblind people.* https://jfly.uni-koeln.de/color
2. Wong, B. (2011). Points of view: Color blindness. *Nature Methods, 8*, 441. https://doi.org/10.1038/nmeth.1618
3. Tol, P. (2021). *Colour Schemes* (Technical note SRON/EPS/TN/09-002). SRON. https://personal.sron.nl/~pault/
4. Nuñez, J. R., Anderton, C. R., & Renslow, R. S. (2018). Optimizing colormaps with consideration for color vision deficiency to enable accurate interpretation of scientific data. *PLOS ONE, 13*(7), e0199239. https://doi.org/10.1371/journal.pone.0199239
5. Machado, G. M., Oliveira, M. M., & Fernandes, L. A. F. (2009). A physiologically-based model for simulation of color vision deficiency. *IEEE Transactions on Visualization and Computer Graphics, 15*(6), 1291–1298.
