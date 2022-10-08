# Feature Modeling

In order to generate only valid _Service Templates_, feature Models can be used to model dependencies between Variability Inputs.
Therefore, we implemented a [FeatureIDE](https://featureide.github.io){target=_blank} integration for the _ExtendedXML Configuration_.

```xml linenums="1"
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<extendedConfiguration>
    <feature automatic="selected" manual="undefined" name="Application"/>
    <feature automatic="selected" manual="selected" name="Feature A">
        <attribute name="attr_bool_true" value="true"/>
        <attribute name="attr_bool_false" value="false"/>
        <attribute name="attr LoNg" value="3"/>
        <attribute name="attr_double" value="2.5"/>
        <attribute name="attr_string" value="hello world"/>
    </feature>
    <feature automatic="undefined" manual="undefined" name="Feature B"/>
    <feature automatic="undefined" manual="selected" name="Feature C">
        <attribute name="__name" value="feature_overridden"/>
    </feature>
    <feature automatic="undefined" manual="selected" name="Feature D">
        <attribute name="attr Long" value="1"/>
        <attribute name="__name_attr_long" value="attr_overridden"/>
    </feature>
    <feature automatic="undefined" manual="selected" name="Feature E">
        <attribute name="__name" value="feature_another_overridden"/>
        <attribute name="attr_double" value="1337"/>
        <attribute name="attr_string" value="something"/>
        <attribute name="__name_attr_string" value="attr_also_overridden"/>
    </feature>
</extendedConfiguration>
```

```yaml linenums="1"
model: true
feature_a: true #(1)
feature_a_attr_overridden: 1 #(2)
feature_a_attr_string: 'hello world' #(3)
feature_a_attr_double: 2.5 #(4)
feature_a_attr_bool_true: true #(5)
feature_a_attr_bool_false: false 
feature_b: true
feature_b_attr_long: 3 #(6)
feature_c: false
feature_overridden: true #(7)
feature_another_overridden: true 
feature_another_overridden_attr_double: 1337 #(8)
```

1.  `Feature A` is normalized to `feature_a`
1.  `attr_overridden` instead of `attr_long` is used due to `__name_attr_long`
1.  Value is a string
1.  Value is a number
1.  Value is a boolean
1.  Value is a number
1.  `feature_overridden` instead of `feature_d` is used due to `__name`
1.  `feature_another_overridden_attr_double` instaed of `feature_e_attr_double` is used due to `__name`
