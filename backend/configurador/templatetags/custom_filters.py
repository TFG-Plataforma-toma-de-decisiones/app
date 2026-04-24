from django import template
from itertools import zip_longest as itertools_zip_longest

register = template.Library()

@register.filter
def zip_longest(a, b):
    return itertools_zip_longest(a or [], b or [], fillvalue=None)