# Limitations

In the following we briefly discuss limitations of our prototypical implementation. 

1. We expect that each relationship templates is used exactly once
1. We expect that `relationships` at requirement assignments is a string
1. We expect hosting relations match `/^(.*_)?host(_.*)?$/` since we do not implement the TOSCA type system.