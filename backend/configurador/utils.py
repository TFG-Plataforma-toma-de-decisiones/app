def features_set_by_name(features_list):
    return set(f.split("-")[0] for f in features_list)